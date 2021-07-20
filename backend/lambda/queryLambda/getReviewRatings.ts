//import * as gremlin from "gremlin"
import { structure, process as gprocess , driver } from './gremlinReturnConversion'
import {  Edges, getReviewRatingsReturn, StateReturn, Vertics, VerticsPersonLabel, VerticsReviewLabel, VerticsReviewRatingLabel, VerticsStateLabel } from "./QueryTypes"

const DriverRemoteConnection = driver.DriverRemoteConnection
const Graph = structure.Graph
//const uri = process.env.NEPTUNE_READER
declare var process: {
    env: {
        
        NEPTUNE_READER: string,
        NEPTUNE_PORT: string
    }
}

export default async function getReviewRatings(reviewId: string) {

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
        let data = await g.V().hasLabel(`${Vertics.REVIEW}`).
        has(`${VerticsReviewLabel.REVIEW_ID}`,`${reviewId}`).
        inE(`${Edges.ABOUT}`).otherV().
        project(
            `${getReviewRatingsReturn.label}`,
            `${getReviewRatingsReturn.id}`,
            `${getReviewRatingsReturn.rating}`,
            `${getReviewRatingsReturn.createdAt}`,
            `${getReviewRatingsReturn.aboutReview}`,
            `${getReviewRatingsReturn.createrId}`,
            `${getReviewRatingsReturn.createrFirstName}`,
            `${getReviewRatingsReturn.createrLastName}`,

        ).
        by(__.label()).
        by(`${VerticsReviewRatingLabel.REVIEW_RATING_ID}`).
        by(`${VerticsReviewRatingLabel.RATING}`).
        by(`${VerticsReviewRatingLabel.REVIEW_DATE}`).
        by(__.outE(`${Edges.ABOUT}`).otherV().values(`${VerticsReviewLabel.REVIEW_ID}`)).
        by(__.inE(`${Edges.WROTE}`).otherV().values(`${VerticsPersonLabel.PERSON_ID}`)).
        by(__.inE(`${Edges.WROTE}`).otherV().values(`${VerticsPersonLabel.FIRST_NAME}`)).
        by(__.inE(`${Edges.WROTE}`).otherV().values(`${VerticsPersonLabel.LAST_NAME}`)).
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