import * as gremlin from "gremlin"
import {
    EdgeFriendshipLabel,
    Edges,
    FriendRequestStatus,
    getMyFriendsOfFriendsReturn,
    Vertics,
    VerticsCityLabel,
    VerticsPersonLabel
} from "./QueryTypes"

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_READER

export default async function GetMyFriendsOfFriends(myId: String) {



    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})

    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gremlin.process.statics

    try {
        let data = await g.V().has(`${Vertics.PERSON}`, `${VerticsPersonLabel.PERSON_ID}`, `${myId}`).
            bothE(`${Edges.FRIENDSHIP}`).has(`${EdgeFriendshipLabel.STATUS}`, `${FriendRequestStatus.CONFIRMED}`).
            otherV().
            bothE(`${Edges.FRIENDSHIP}`).has(`${EdgeFriendshipLabel.STATUS}`, `${FriendRequestStatus.CONFIRMED}`).
            otherV().not(__.has(`${VerticsPersonLabel.PERSON_ID}`, `${myId}`)).
            project(
                `${getMyFriendsOfFriendsReturn.label}`,
                `${getMyFriendsOfFriendsReturn.personId}`,
                `${getMyFriendsOfFriendsReturn.firstName}`,
                `${getMyFriendsOfFriendsReturn.lastName}`,
                `${getMyFriendsOfFriendsReturn.email}`,
                `${getMyFriendsOfFriendsReturn.city}`,
            ).
            by(__.label()).
            by(`${VerticsPersonLabel.PERSON_ID}`).
            by(`${VerticsPersonLabel.FIRST_NAME}`).
            by(`${VerticsPersonLabel.LAST_NAME}`).
            by(`${VerticsPersonLabel.EMAIL}`).
            by(
                __.out(`${Edges.LIVES}`).values(`${VerticsCityLabel.NAME}`)
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


    } catch (err) {
        console.log("ERROR", err)
        return null
    }


}