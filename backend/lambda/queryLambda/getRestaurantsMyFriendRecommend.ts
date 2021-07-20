//import * as gremlin from "gremlin"
import { structure, process as gprocess , driver } from './gremlinReturnConversion'
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"
import { EdgeFriendshipLabel, Edges, FriendRequestStatus, Vertics, VerticsPersonLabel, VerticsRestaurantLabel, VerticsReviewLabel } from "./QueryTypes"

const DriverRemoteConnection = driver.DriverRemoteConnection
const Graph = structure.Graph
//const uri = process.env.NEPTUNE_READER

declare var process: {
    env: {
        
        NEPTUNE_READER: string,
        NEPTUNE_PORT: string
    }
}

export default async function GetRestaurantsMyFriendRecommend(myId : String) {

    //let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`,{})
    //let dc = new DriverRemoteConnection(`ws://${uri}/gremlin`)
    let dc = new DriverRemoteConnection(`wss://${process.env.NEPTUNE_READER}:${process.env.NEPTUNE_PORT}/gremlin`, {
        MimeType: 'application/vnd.gremlin-v2.0+json',
        Headers: {},
    })
    
    console.log('NEPTUNE_READER',process.env.NEPTUNE_READER)
    console.log('NEPTUNE_PORT',process.env.NEPTUNE_PORT)


    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gprocess.statics
    const order = gprocess.order
    const values = gprocess.column.values
    const keys = gprocess.column.keys

    try {
        let data = await g.V().as('vertics')
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
           // 'restaurant_id',
        ).
        by(
            __.select('reviews').outV().values(`${VerticsReviewLabel.RATING}`)
        ).
        by(
            __.select('reviews').inV().values(`${VerticsRestaurantLabel.RESTAURANT_NAME}`)
        ).
        //by( __.select('reviews').inV().values(`${VerticsRestaurantLabel.RESTAURANT_ID}`)).
        group().
        by('restaurant_name').
        by(__.select('review_rating').sum().as('rating')).
        //by(__.select('restaurant_id')).
        unfold().
        order().
        by(values ,order.desc).
        project(
            'restaurantName',
            'rating'
        ).by(
            keys
            //__.select(last,'vertics').label()
        ).
        by(
            values
        ).
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