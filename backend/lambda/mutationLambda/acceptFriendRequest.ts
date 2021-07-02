import * as gremlin from "gremlin"
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { EdgeFriendshipLabel, Edges, FriendRequestInput, Vertics, VerticsPersonLabel } from "./MutationTypes"
import { FriendRequestStatus } from "./MutationTypes"

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_WRITER

export default async function acceptFriendRequest(myIdAndFriendId: FriendRequestInput) {

    // const addFriendRequest = {
    //     review_id: nanoid(10),
    //     rating: reviewDetail.rating,
    //     body: reviewDetail.body,
    //     about_restaurant: reviewDetail.aboutRestaurant,
    //     createdAt: reviewCreatedAt,
    //     createrId: reviewDetail.myId
    // }

    //let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    let dc = new DriverRemoteConnection(`ws://${uri}/gremlin`)


    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    // person_id --(friends(status: requested ))-> person_id
    //     g.V().has("person","first_name","Kelly").
    // inE().has("status","requested").
    // where(otherV().has("first_name","Jim")).as("e").
    // inV().has("first_name","Kelly").
    // select("e").
    // property("status","updated").iterate()

    const __ = gremlin.process.statics







    try {
        let friendRequest = await g.V().has(`${Vertics.PERSON}`, `${VerticsPersonLabel.PERSON_ID}`, `${myIdAndFriendId.myId}`).
            inE(`${Edges.FRIENDSHIP}`).has(`${EdgeFriendshipLabel.STATUS}`, `${FriendRequestStatus.REQUESTED}`).
            where(__.otherV().has(`${VerticsPersonLabel.PERSON_ID}`, `${myIdAndFriendId.friendId}`)).as("e").
            inV().has(`${VerticsPersonLabel.PERSON_ID}`, `${myIdAndFriendId.myId}`).
            select("e").
            property(`${EdgeFriendshipLabel.STATUS}`, `${FriendRequestStatus.CONFIRMED}`).iterate()




        console.log("freindRequest Detail:", friendRequest)




        //let vertices = Array()

        // for (const v of data) {
        //     const _properties = await g.V(v.id).properties().toList()

        //     let post = _properties.reduce((acc, next)=>{
        //         acc[next.label] = next.value
        //     })
        // }
        dc.close()
        console.log("Requested accepted", friendRequest)
        return friendRequest


    } catch (err) {
        console.log("ERROR", err)
        return null
    }


}

