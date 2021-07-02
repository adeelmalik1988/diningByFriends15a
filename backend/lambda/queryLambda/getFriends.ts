import * as gremlin from "gremlin"
import { EdgeFriendshipLabel, Edges, FreindRequestReturn, FriendRequestStatus, Vertics, VerticsPersonLabel } from "./QueryTypes"

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_READER

export default async function GetFriends(myId: string) {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`,{})

    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gremlin.process.statics

    try {
        let data = await g.V().has(`${Vertics.PERSON}`, `${VerticsPersonLabel.PERSON_ID}`, `${myId}`).as('v').
        select("v").inE(`${Edges.FRIENDSHIP}`).has(`${EdgeFriendshipLabel.STATUS}`, `${FriendRequestStatus.CONFIRMED}`).as("e").
        project(
            `${FreindRequestReturn.personId}`,
            `${FreindRequestReturn.firstName}`,
            `${FreindRequestReturn.lastName}`,
        ).
        by(__.select("e").otherV().values(`${VerticsPersonLabel.PERSON_ID}`)).
        by(__.select("e").otherV().values(`${VerticsPersonLabel.FIRST_NAME}`)).
        by(__.select("e").otherV().values(`${VerticsPersonLabel.LAST_NAME}`)).
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