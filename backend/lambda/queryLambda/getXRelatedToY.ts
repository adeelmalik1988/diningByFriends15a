//import * as gremlin from "gremlin"
import { structure, process as gprocess , driver } from './gremlinReturnConversion'
import { EdgeFriendshipLabel, Edges, FriendRequestStatus, Vertics, VerticsPersonLabel, XRelatedToYInput } from "./QueryTypes"

const DriverRemoteConnection = driver.DriverRemoteConnection
const Graph = structure.Graph
//const uri = process.env.NEPTUNE_READER
declare var process: {
    env: {
        
        NEPTUNE_READER: string,
        NEPTUNE_PORT: string
    }
}

export default async function GetXRelatedToY(xAndYIds: XRelatedToYInput) {

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
        let data = 
        await g.V().hasLabel(`${Vertics.PERSON}`).
            has(`${VerticsPersonLabel.PERSON_ID}`,`${xAndYIds.xId}`).
            until(__.has(`${Vertics.PERSON}`,`${VerticsPersonLabel.PERSON_ID}`,`${xAndYIds.yId}`)).
            repeat(
                __.bothE(`${Edges.FRIENDSHIP}`).has(`${EdgeFriendshipLabel.STATUS}`,`${FriendRequestStatus.CONFIRMED}`).otherV().
                simplePath()
            ).
            dedup().
            path().
            by(__.values(`${VerticsPersonLabel.FIRST_NAME}`)).
            // by(__.project(
            //     'name',
            // ).by(__.values(`${VerticsPersonLabel.FIRST_NAME}`))).
            by(__.label()).
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