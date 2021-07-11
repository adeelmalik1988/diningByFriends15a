//import * as gremlin from "gremlin"
import { structure, process as gprocess , driver } from './gremlinReturnConversion'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { RestaurantInput, Vertics, VerticsCuisineLabel, VerticsRestaurantLabel } from "./MutationTypes"
import { nanoid } from "nanoid"
import * as appsync from "aws-appsync"
const gql =  require("graphql-tag")
require("cross-fetch/polyfill")

declare var process: {
    env: {

        NEPTUNE_WRITER: string,
        NEPTUNE_PORT: string,
        APPSYNC_ENDPOINT_URL: string,
        AWS_REGION: string,
        AWS_ACCESS_KEY_ID: string,
        AWS_SECRET_ACCESS_KEY: string,
        AWS_SESSION_TOKEN: string
        
    }
}


const DriverRemoteConnection = driver.DriverRemoteConnection
const Graph = structure.Graph
const uri = process.env.NEPTUNE_WRITER

type cuisineDetail = {
    cuisineName: String
}

export default async function createCuisine(cuisineDetail: cuisineDetail) {

    const addCuisine = {
        cuisine_id: nanoid(10),
        cuisine_name: cuisineDetail.cuisineName,

    }

    console.log('addCuisine',addCuisine)

    //let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    //let dc = new DriverRemoteConnection(`ws://${uri}/gremlin`)

    let dc = new DriverRemoteConnection(`wss://${process.env.NEPTUNE_WRITER}:${process.env.NEPTUNE_PORT}/gremlin`, {
        MimeType: 'application/vnd.gremlin-v2.0+json',
        Headers: {},
    })
    console.log('NEPTUNE_WRITER', process.env.NEPTUNE_WRITER)
    console.log('NEPTUNE_PORT', process.env.NEPTUNE_PORT)



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