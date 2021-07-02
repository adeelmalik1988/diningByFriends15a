import * as gremlin from "gremlin"
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"
import { Edges, PersonReturn, Vertics, VerticsCityLabel, VerticsPersonLabel } from "./QueryTypes"

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_READER

export default async function GetPersonsById(personId: String) {
    const personDetailById = personId
    

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`,{})

    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gremlin.process.statics

    try {
        let data = await g.V().has(`${Vertics.PERSON}`,`${VerticsPersonLabel.PERSON_ID}`,`${personDetailById}`).as('v').
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
        //await g.V(`${personId}`).toList()
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