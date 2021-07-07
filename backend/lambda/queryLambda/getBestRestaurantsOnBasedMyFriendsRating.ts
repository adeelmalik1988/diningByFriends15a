import * as gremlin from "gremlin"

import { EdgeFriendshipLabel, Edges, FriendRequestStatus, Vertics, VerticsPersonLabel, VerticsRestaurantLabel, VerticsReviewLabel } from "./QueryTypes"

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_READER

export default async function GetBestRestaurantsOnBasedMyFriendsRating(myId: string) {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`,{})

    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gremlin.process.statics
    const order = gremlin.process.order
    const values = gremlin.process.column.values

    try {
        let data = await g.V()
        .has(`${Vertics.PERSON}`, `${VerticsPersonLabel.PERSON_ID}`, `${myId}`).
        store('x').
        bothE(`${Edges.FRIENDSHIP}`).where(__.has(`${EdgeFriendshipLabel.STATUS}`, `${FriendRequestStatus.CONFIRMED}`)).
        store('x').
        otherV().store('x').
        outE(`${Edges.WROTE}`).store(`x`).inV().
        optional(
            __.hasLabel(`${Vertics.REVIEW_RATING}`).outE(`${Edges.ABOUT}`).
                inV()

        ).
        //otherV().store('x').
        outE(`${Edges.ABOUT}`).store('x').
        otherV().
        // //dedup().
        //store('x').
        // aggregate('agrlist').
        cap('x').
        unfold().
        hasLabel(`${Edges.ABOUT}`).as('reviews').
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
        limit(1).
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