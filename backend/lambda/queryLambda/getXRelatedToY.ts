import * as gremlin from "gremlin"
import { EdgeFriendshipLabel, Edges, FriendRequestStatus, Vertics, VerticsPersonLabel, XRelatedToYInput } from "./QueryTypes"

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_READER

export default async function GetXRelatedToY(xAndYIds: XRelatedToYInput) {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})

    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gremlin.process.statics

    try {
        let data = await g.V().hasLabel(`${Vertics.PERSON}`).
        has(`${VerticsPersonLabel.PERSON_ID}`,`${xAndYIds.xId}`).
        until(__.has(`${Vertics.PERSON}`,`${VerticsPersonLabel.PERSON_ID}`,`${xAndYIds.yId}`)).
        repeat(
            __.bothE(`${Edges.FRIENDSHIP}`).has(`${EdgeFriendshipLabel.STATUS}`,`${FriendRequestStatus.CONFIRMED}`).otherV().
            simplePath()
        ).path().
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