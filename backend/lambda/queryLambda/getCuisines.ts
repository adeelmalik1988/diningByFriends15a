import * as gremlin from "gremlin"
import {  CuisineReturn, Vertics, VerticsCuisineLabel } from "./QueryTypes"

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_READER

export default async function getCuisines() {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})

    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gremlin.process.statics

    try {
        let data = await g.V().hasLabel(`${Vertics.CUISINE}`).as("v").
        project(
            `${CuisineReturn.label}`,
            `${CuisineReturn.cuisineId}`,
            `${CuisineReturn.cuisineName}`,
        ).
        by(__.select("v").label()).
        by(`${VerticsCuisineLabel.CUISINE_ID}`).
        by(`${VerticsCuisineLabel.CUISINE_NAME}`).
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