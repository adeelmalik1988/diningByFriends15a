//import * as gremlin from "gremlin"
import { structure, process as gprocess , driver } from './gremlinReturnConversion'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { EdgeFriendshipLabel, Edges, FriendRequestInput, Vertics, VerticsPersonLabel } from "./MutationTypes"
import { nanoid } from "nanoid"
import * as moment from "moment-timezone"
import { FriendRequestStatus } from "./MutationTypes"

const DriverRemoteConnection = driver.DriverRemoteConnection
const Graph = structure.Graph
//const uri = process.env.NEPTUNE_WRITER
declare var process: {
    env: {

        NEPTUNE_WRITER: string,
        NEPTUNE_PORT: string
    }
}

export default async function sendFriendRequest(myIdAndFriendId: FriendRequestInput) {
 
    // const addFriendRequest = {
    //     review_id: nanoid(10),
    //     rating: reviewDetail.rating,
    //     body: reviewDetail.body,
    //     about_restaurant: reviewDetail.aboutRestaurant,
    //     createdAt: reviewCreatedAt,
    //     createrId: reviewDetail.myId
    // }
    console.log('myIdAndFriendId', myIdAndFriendId)

    //let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    //let dc = new DriverRemoteConnection(`ws://${uri}/gremlin`)
    let dc = new DriverRemoteConnection(`wss://${process.env.NEPTUNE_WRITER}:${process.env.NEPTUNE_PORT}/gremlin`, {
        MimeType: 'application/vnd.gremlin-v2.0+json',
        Headers: {},
    })
    console.log('NEPTUNE_WRITER', process.env.NEPTUNE_WRITER)
    console.log('NEPTUNE_PORT', process.env.NEPTUNE_PORT)



    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gprocess.statics


    // person_id --(friends(status: requested ))-> person_id
    try {
        let data = await g.addE(`${Edges.FRIENDSHIP}`).
        from_(__.V().has(`${Vertics.PERSON}`,`${VerticsPersonLabel.PERSON_ID}`,`${myIdAndFriendId.myId}`)).
        to(__.V().has(`${Vertics.PERSON}`,`${VerticsPersonLabel.PERSON_ID}`,`${myIdAndFriendId.friendId}`)).
        property(`${EdgeFriendshipLabel.STATUS}`,`${FriendRequestStatus.REQUESTED}`).
        next()
 
        //let vertices = Array()

        // for (const v of data) {
        //     const _properties = await g.V(v.id).properties().toList()

        //     let post = _properties.reduce((acc, next)=>{
        //         acc[next.label] = next.value
        //     })
        // }
        dc.close()
        console.log("Restaurant Added", data)
        return data


    } catch (err) {
        console.log("ERROR", err)
        return null
    }


}