//import * as gremlin from "gremlin"
import { structure, process as gprocess , driver } from './gremlinReturnConversion'
import { PersonInput, VerticsPersonLabel, Vertics, MutationActions, VerticsCityLabel, Edges } from "./MutationTypes"
import * as appsync from "aws-appsync"
import { nanoid } from "nanoid"
const gql = require("graphql-tag")
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
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
            sessionToken: process.env.AWS_SESSION_TOKEN || "",
        }
    },
    disableOffline: true,

})

// type ACTIONS = 
//     "REVIEW_CREATED" |
//     "REVIEW_RATING_CREATED" |
//     "PERSON_ADDED" |
//     "RESTAURANT_ADDED"

const mutation = gql`mutation addionOfResouces($action: String!){
    addionOfResouces(action: $action)

}`

const DriverRemoteConnection = driver.DriverRemoteConnection
const Graph = structure.Graph
//const uri = process.env.NEPTUNE_WRITER

export default async function createPerson(personDetail: PersonInput) {



    const addPerson = {
        first_name: personDetail.firstName,
        last_name: personDetail.lastName,
        email: personDetail.email,
        person_id: nanoid(10),
        city_id: personDetail.cityId

    }

    console.log('addPerson :', addPerson)


    //let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`,{})
    //let dc = new DriverRemoteConnection(`ws://${uri}/gremlin`)
    let dc = new DriverRemoteConnection(`wss://${process.env.NEPTUNE_WRITER}:${process.env.NEPTUNE_PORT}/gremlin`, {
        MimeType: 'application/vnd.gremlin-v2.0+json',
        Headers: {},
    })
    console.log('NEPTUNE_WRITER', process.env.NEPTUNE_WRITER)
    console.log('NEPTUNE_PORT', process.env.NEPTUNE_PORT)



    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gprocess.statics

    try {
        let data = await g.addV(`${Vertics.PERSON}`).
            property(`${VerticsPersonLabel.PERSON_ID}`, addPerson.person_id).
            property(`${VerticsPersonLabel.FIRST_NAME}`, addPerson.first_name).
            property(`${VerticsPersonLabel.LAST_NAME}`, addPerson.last_name).
            property(`${VerticsPersonLabel.EMAIL}`, addPerson.email).as("addedPerson").
            addE(`${Edges.LIVES}`).from_('addedPerson').to(__.V().has(`${Vertics.CITY}`,`${VerticsCityLabel.CITY_ID}`,`${addPerson.city_id}`)).
            iterate()
        //let vertices = Array()

        // for (const v of data) {
        //     const _properties = await g.V(v.id).properties().toList()

        //     let post = _properties.reduce((acc, next)=>{
        //         acc[next.label] = next.value
        //     })
        // }
        dc.close()

        console.log("data recieved:", data)

        const result = await graphqlClient.mutate({
            mutation,
            variables: {
                action: `${MutationActions.PERSON_ADDED}`
            }
        })

        console.log("mutation Called", result)


        return data


    } catch (err) {
        console.log("ERROR", err)
        return null
    }


}