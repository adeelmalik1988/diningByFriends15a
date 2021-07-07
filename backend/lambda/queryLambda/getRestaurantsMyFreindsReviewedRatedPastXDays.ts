import * as gremlin from "gremlin"
import { EdgeFriendshipLabel, Edges, FriendRequestStatus, RestaurantsMyFreindsReviewedRatedPastXDaysInput, Vertics, VerticsPersonLabel, VerticsRestaurantLabel, VerticsReviewLabel, VerticsReviewRatingLabel } from './QueryTypes'

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_READER

export default async function GetRestaurantsMyFreindsReviewedRatedPastXDays(myIdAndPastDays: RestaurantsMyFreindsReviewedRatedPastXDaysInput) {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`,{})

    var datenow = new Date()
    var days = myIdAndPastDays.pastDays
    var datelast = new Date(datenow.getTime() - (days * 24 * 60 * 60 * 1000)).toISOString()

    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gremlin.process.statics
    const gte = gremlin.process.P.gte
    const values = gremlin.process.column.values
    const order = gremlin.process.order

    try {
        let data = await g.V()
        .has(`${Vertics.PERSON}`, `${VerticsPersonLabel.PERSON_ID}`, `${myIdAndPastDays.myId}`).
        store('x').
        bothE(`${Edges.FRIENDSHIP}`).where(__.has(`${EdgeFriendshipLabel.STATUS}`, `${FriendRequestStatus.CONFIRMED}`)).
        store('x').
        otherV().store('x').
        outE(`${Edges.WROTE}`).
        where(
            __.otherV().or(

                __.has(`${VerticsReviewLabel.CREATED_DATE}`,gte(
                    `${datelast}`
                    )),
                    __.has(`${VerticsReviewRatingLabel.REVIEW_DATE}`,gte(
                        `${datelast}`
                        ))

                    )
        ).
        store(`x`).inV().
        optional(
            __.hasLabel(`${Vertics.REVIEW_RATING}`).
            where(
            __.has(`${VerticsReviewRatingLabel.REVIEW_DATE}`,gte(
                `${datelast}`
            ))
            ).
            outE(`${Edges.ABOUT}`).
            //store('x').
                inV()

        ).
        
        outE(`${Edges.ABOUT}`).store('x').
        otherV().
        // //dedup().
        //store('x').
        // aggregate('agrlist').
        cap('x').
        unfold().
        hasLabel(`${Edges.ABOUT}`).
        as('reviews').
        project(
            'review_rating',
            'restaurant_name',
        ).
        by(
            __.select('reviews').outV().values(`${VerticsReviewLabel.RATING}`)
        ).
        by(
            __.select('reviews').inV().values(`${VerticsRestaurantLabel.RESTAURANT_NAME}`)
        ).
        group().
        by('restaurant_name').
        by(__.select('review_rating').sum().as('rating')).
        unfold().
        order().
        by(values ,order.desc).
        // //limit(1).
        toList()
        //let vertices = Array()

        // for (const v of data) {
        //     const _properties = await g.V(v.id).properties().toList()

        //     let post = _properties.reduce((acc, next)=>{
        //         acc[next.label] = next.value
        //     })
        // }
        dc.close()
        console.log("data from GraphDB", data)
        return data


    } catch(err){
        console.log("ERROR", err)
        return null
    }


}