import * as gremlin from "gremlin"
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"
import { Edges, Vertics, VerticsRestaurantLabel, VerticsReviewLabel, GetRestaurantNewestReviewsReturn, VerticsPersonLabel } from "./QueryTypes"

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_READER

export default async function GetRestaurantNewestReviews(RestaurantId: string) {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`,{})

    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gremlin.process.statics
    const order = gremlin.process.order

    try {
        let data = await g.V().has(`${Vertics.RESTAURANT}`, `${VerticsRestaurantLabel.RESTAURANT_ID}`, `${RestaurantId}`).as('review').
        select('review').in_(`${Edges.ABOUT}`).
        order().
        by(`${VerticsReviewLabel.CREATED_DATE}`, order.desc).
        project(
            `${GetRestaurantNewestReviewsReturn.label}`,
            `${GetRestaurantNewestReviewsReturn.reviewId}`,
            `${GetRestaurantNewestReviewsReturn.createdDate}`,
            `${GetRestaurantNewestReviewsReturn.rating}`,
            `${GetRestaurantNewestReviewsReturn.body}`,
            `${GetRestaurantNewestReviewsReturn.createrId}`,
            `${GetRestaurantNewestReviewsReturn.createrFirstName}`,
            `${GetRestaurantNewestReviewsReturn.createrLastName}`,
        ).
        by(__.label()).
        by(__.values(`${VerticsReviewLabel.REVIEW_ID}`)).
        by(__.values(`${VerticsReviewLabel.CREATED_DATE}`)).
        by(__.values(`${VerticsReviewLabel.RATING}`)).
        by(__.values(`${VerticsReviewLabel.BODY}`)).
        by(__.in_(`${Edges.WROTE}`).values(`${VerticsPersonLabel.PERSON_ID}`)).
        by(__.in_(`${Edges.WROTE}`).values(`${VerticsPersonLabel.FIRST_NAME}`)).
        by(__.in_(`${Edges.WROTE}`).values(`${VerticsPersonLabel.LAST_NAME}`)).
        toList()

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