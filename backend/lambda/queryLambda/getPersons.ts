//import * as gremlin from "gremlin"
import { structure, process as gprocess , driver } from './gremlinReturnConversion'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { Edges, PersonReturn, Vertics, VerticsPersonLabel, VerticsCityLabel } from "./QueryTypes"


const DriverRemoteConnection = driver.DriverRemoteConnection
const Graph = structure.Graph

//const uri = process.env.NEPTUNE_READER

declare var process: {
    env: {
        
        NEPTUNE_READER: string,
        NEPTUNE_PORT: string
    }
}

export default async function GetPersons() {

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
        let data = await g.V().hasLabel(`${Vertics.PERSON}`).as('v').
            project(
                `${PersonReturn.id}`,
                `${PersonReturn.firstName}`,
                `${PersonReturn.lastName}`,
                `${PersonReturn.email}`,
                `${PersonReturn.city}`,
                `${PersonReturn.label}`,
            ).
            by(`${VerticsPersonLabel.PERSON_ID}`).
            by(`${VerticsPersonLabel.FIRST_NAME}`).
            by(`${VerticsPersonLabel.LAST_NAME}`).
            by(`${VerticsPersonLabel.EMAIL}`).
            by(__.select("v").out(`${Edges.LIVES}`).values(`${VerticsCityLabel.NAME}`)).
            by(__.select("v").label()).
            toList()
        //await g.V().hasLabel("Person").toList()
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