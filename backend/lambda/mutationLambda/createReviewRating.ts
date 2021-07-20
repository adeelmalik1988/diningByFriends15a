//import * as gremlin from "gremlin"
import { structure, process as gprocess , driver } from './gremlinReturnConversion'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { Edges, MutationActions, ReviewRatingInput, Vertics, VerticsPersonLabel, VerticsReviewLabel, VerticsReviewRatingLabel } from "./MutationTypes"
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
//const uri = process.env.NEPTUNE_WRITER

export default async function createReviewRating(reviewRatingDetail: ReviewRatingInput) {
    var dateTime = new Date().toISOString()
    let reviewRatingCreatedAt = dateTime
    
    console.log("Review Created At:", reviewRatingCreatedAt  )



    const addReviewRating = {
        review_rating_id: nanoid(10),
        about: reviewRatingDetail.aboutReview,
        rating: Number(
            reviewRatingDetail.rating
        ),
        createdBy: reviewRatingDetail.myId,
        createdAt: reviewRatingCreatedAt
    }

    console.log('addReviewRating', addReviewRating)

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
    const __ = gprocess.statics
    //person_id --(wrote)-> review_rating --(about)--> review
    try {
        let data = await g.addV(`${Vertics.REVIEW_RATING}`).
        property(`${VerticsReviewRatingLabel.REVIEW_RATING_ID}`, addReviewRating.review_rating_id).
        property(`${VerticsReviewRatingLabel.RATING}`, addReviewRating.rating).
        property(`${VerticsReviewRatingLabel.REVIEW_DATE}`, addReviewRating.createdAt).as("addedReviewRating").
        addE(`${Edges.WROTE}`).from_(__.V().has(`${Vertics.PERSON}`,`${VerticsPersonLabel.PERSON_ID}`,`${addReviewRating.createdBy}`)).to("addedReviewRating").
        addE(`${Edges.ABOUT}`).from_("addedReviewRating").to(__.V().has(`${Vertics.REVIEW}`,`${VerticsReviewLabel.REVIEW_ID}`,`${addReviewRating.about}`)).
        iterate()
        //let vertices = Array()

        // for (const v of data) {
        //     const _properties = await g.V(v.id).properties().toList()

        //     let post = _properties.reduce((acc, next)=>{
        //         acc[next.label] = next.value
        //     })
        // }
        dc.close()

        // const result = await graphqlClient.mutate({
        //     mutation,
        //     variables: {
        //         action: `${MutationActions.REVIEW_RATING_CREATED}`
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