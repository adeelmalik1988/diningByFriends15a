//import * as gremlin from "gremlin"
import { structure, process as gprocess , driver } from './gremlinReturnConversion'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { Edges, MutationActions, RestaurantInput, Vertics, VerticsCityLabel, VerticsCuisineLabel, VerticsRestaurantLabel } from "./MutationTypes"
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

//creating graphql client
const graphqlClient = new appsync.AWSAppSyncClient({
    url: process.env.APPSYNC_ENDPOINT_URL || "",
    region: process.env.AWS_REGION || "",
    auth: {
        type: "AWS_IAM",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "" ,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ||"",
            sessionToken: process.env.AWS_SESSION_TOKEN || "",
        }
    },
    disableOffline: true,

})

const mutation = gql`mutation addionOfResouces($action: String!){
    addionOfResouces(action: $action)

}`

const DriverRemoteConnection = driver.DriverRemoteConnection
const Graph = structure.Graph
const uri = process.env.NEPTUNE_WRITER

export default async function createRestaurant(restaurantDetail: RestaurantInput) {

    const addResturant = {
        restaurant_id: nanoid(10),
        name: restaurantDetail.name,
        address: restaurantDetail.address,
        city_id: restaurantDetail.cityId,
        state_id: restaurantDetail.stateId,
        cuisine_id: restaurantDetail.cuisineId
    }

    console.log('addResturant', addResturant)

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
    const __ = gprocess.statics


    try {
        let data = await g.addV(`${Vertics.RESTAURANT}`).
        property(`${VerticsRestaurantLabel.RESTAURANT_ID}`, addResturant.restaurant_id).
        property(`${VerticsRestaurantLabel.RESTAURANT_NAME}`, addResturant.name).
        property(`${VerticsRestaurantLabel.ADDRESS}`, addResturant.address).as("addedRestaurant").
        addE(`${Edges.WITHIN}`).from_("addedRestaurant").to(__.V().has(`${Vertics.CITY}`,`${VerticsCityLabel.CITY_ID}`,`${addResturant.city_id}`)).
        addE(`${Edges.SERVES}`).from_("addedRestaurant").to(__.V().has(`${Vertics.CUISINE}`,`${VerticsCuisineLabel.CUISINE_ID}`,`${addResturant.cuisine_id}`)).
        iterate()
        //let vertices = Array()

        // for (const v of data) {
        //     const _properties = await g.V(v.id).properties().toList()

        //     let post = _properties.reduce((acc, next)=>{
        //         acc[next.label] = next.value
        //     })
        // }
        dc.close()
        console.log("Restaurant Added", data)


        // const result = await graphqlClient.mutate({
        //     mutation,
        //     variables: {
        //         action: `${MutationActions.RESTAURANT_ADDED}`
        //     }
        // })

        // console.log("mutation Called", result)



        return data


    } catch (err) {
        console.log("ERROR", err)
        dc.close()

        return null
    }


}