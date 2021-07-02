import * as gremlin from "gremlin"
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { RestaurantInput, Vertics, VerticsCuisineLabel, VerticsRestaurantLabel } from "./MutationTypes"
import { nanoid } from "nanoid"
import * as appsync from "aws-appsync"
const gql =  require("graphql-tag")
require("cross-fetch/polyfill")



const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_WRITER

export default async function createCuisine(cuisineName: String) {

    const addCuisine = {
        cuisine_id: nanoid(10),
        cuisine_name: cuisineName,

    }

    //let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    let dc = new DriverRemoteConnection(`ws://${uri}/gremlin`)


    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    //restaurant_id --(within)-> city --(within)--> state
    try {
        let data = await g.addV(`${Vertics.CUISINE}`).
        property(`${VerticsCuisineLabel.CUISINE_ID}`, addCuisine.cuisine_id).
        property(`${VerticsCuisineLabel.CUISINE_NAME}`, addCuisine.cuisine_name).
        next()
        //let vertices = Array()

        // for (const v of data) {
        //     const _properties = await g.V(v.id).properties().toList()

        //     let post = _properties.reduce((acc, next)=>{
        //         acc[next.label] = next.value
        //     })
        // }
        dc.close()
        console.log("Cuisine Added", data)



        return data


    } catch (err) {
        console.log("ERROR", err)
        return null
    }


}