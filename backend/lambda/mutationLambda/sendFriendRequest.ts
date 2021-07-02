import * as gremlin from "gremlin"
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { EdgeFriendshipLabel, Edges, FriendRequestInput, Vertics, VerticsPersonLabel } from "./MutationTypes"
import { nanoid } from "nanoid"
import * as moment from "moment-timezone"
import { FriendRequestStatus } from "./MutationTypes"

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_WRITER

export default async function sendFriendRequest(myIdAndFriendId: FriendRequestInput) {
 
    // const addFriendRequest = {
    //     review_id: nanoid(10),
    //     rating: reviewDetail.rating,
    //     body: reviewDetail.body,
    //     about_restaurant: reviewDetail.aboutRestaurant,
    //     createdAt: reviewCreatedAt,
    //     createrId: reviewDetail.myId
    // }
    const freindStatus = ""

    //let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    let dc = new DriverRemoteConnection(`ws://${uri}/gremlin`)


    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gremlin.process.statics


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