import * as gremlin from "gremlin"
import { PersonInput, VerticsPersonLabel, Vertics, MutationActions, VerticsCityLabel, Edges } from "./MutationTypes"
import * as appsync from "aws-appsync"
import { nanoid } from "nanoid"
const gql = require("graphql-tag")
require("cross-fetch/polyfill")

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

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_WRITER

export default async function createPerson(personDetail: PersonInput) {

    const addPerson = {
        first_name: personDetail.firstName,
        last_name: personDetail.lastName,
        email: personDetail.email,
        person_id: nanoid(10),
        city_id: personDetail.cityId

    }

    //let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`,{})
    let dc = new DriverRemoteConnection(`ws://${uri}/gremlin`)


    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gremlin.process.statics

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