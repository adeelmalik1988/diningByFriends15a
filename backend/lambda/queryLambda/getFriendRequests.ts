//import * as gremlin from "gremlin"
import { structure, process as gprocess , driver } from './gremlinReturnConversion'
import { EdgeFriendshipLabel, Edges, FreindRequestReturn, FriendRequestStatus, Vertics, VerticsPersonLabel } from "./QueryTypes"

const DriverRemoteConnection = driver.DriverRemoteConnection
const Graph = structure.Graph
//const uri = process.env.NEPTUNE_READER

declare var process: {
    env: {
        
        NEPTUNE_READER: string,
        NEPTUNE_PORT: string
    }
}

export default async function getFriendRequests(myId: string) {

    //let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
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

    try {
        let data =  await g.V().has(`${Vertics.PERSON}`, `${VerticsPersonLabel.PERSON_ID}`, `${myId}`).as('v').
        select("v").inE(`${Edges.FRIENDSHIP}`).has(`${EdgeFriendshipLabel.STATUS}`, `${FriendRequestStatus.REQUESTED}`).as("e").
        project(
            `${FreindRequestReturn.personId}`,
            `${FreindRequestReturn.firstName}`,
            `${FreindRequestReturn.lastName}`,
        ).
        by(__.select("e").otherV().values(`${VerticsPersonLabel.PERSON_ID}`)).
        by(__.select("e").otherV().values(`${VerticsPersonLabel.FIRST_NAME}`)).
        by(__.select("e").otherV().values(`${VerticsPersonLabel.LAST_NAME}`)).
        toList()
        //await g.V().hasLabel(`${Vertics.CITY}`).as("v")
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