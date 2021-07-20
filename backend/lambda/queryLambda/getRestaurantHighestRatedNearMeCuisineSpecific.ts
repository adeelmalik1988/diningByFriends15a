//import * as gremlin from "gremlin"
import { structure, process as gprocess , driver } from './gremlinReturnConversion'
import { Edges, RestaurantHighestRatedNearMeCuisineSpecificInput, RestaurantReturn, Vertics, VerticsCityLabel, VerticsCuisineLabel, VerticsPersonLabel, VerticsRestaurantLabel, VerticsReviewLabel } from "./QueryTypes"

const DriverRemoteConnection = driver.DriverRemoteConnection
const Graph = structure.Graph
//const uri = process.env.NEPTUNE_READER
declare var process: {
    env: {
        
        NEPTUNE_READER: string,
        NEPTUNE_PORT: string
    }
}

export default async function GetRestaurantHighestRatedNearMeCuisineSpecific(myIdAndCuisine: RestaurantHighestRatedNearMeCuisineSpecificInput) {

    //let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    //let dc = new DriverRemoteConnection(`ws://${uri}/gremlin`)
    console.log('arg passed :', myIdAndCuisine)

    let dc = new DriverRemoteConnection(`wss://${process.env.NEPTUNE_READER}:${process.env.NEPTUNE_PORT}/gremlin`, {
        MimeType: 'application/vnd.gremlin-v2.0+json',
        Headers: {},
    })
    
    console.log('NEPTUNE_READER',process.env.NEPTUNE_READER)
    console.log('NEPTUNE_PORT',process.env.NEPTUNE_PORT)



    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gprocess.statics
    const order = gprocess.order

    try {
        let data =
            await g.V().has(`${Vertics.PERSON}`, `${VerticsPersonLabel.PERSON_ID}`, `${myIdAndCuisine.myId}`).
                outE(`${Edges.LIVES}`).otherV().as('my_city').
                select('my_city').inE(`${Edges.WITHIN}`).otherV().
                filter(__.out(`${Edges.SERVES}`).has(`${VerticsCuisineLabel.CUISINE_ID}`, `${myIdAndCuisine.cuisine}`)

                ).
                as('restaurant').
                project(
                    `${RestaurantReturn.id}`,
                    `${RestaurantReturn.name}`,
                    `${RestaurantReturn.address}`,
                    `${RestaurantReturn.city}`,
                    `${RestaurantReturn.state}`,
                    `${RestaurantReturn.rating}`,
                    `${RestaurantReturn.cuisine}`,
                    `${RestaurantReturn.label}`,
                ).
                by(`${VerticsRestaurantLabel.RESTAURANT_ID}`).
                by(`${VerticsRestaurantLabel.RESTAURANT_NAME}`).
                by(`${VerticsRestaurantLabel.ADDRESS}`).
                by(__.select("restaurant").outE(`${Edges.WITHIN}`).otherV().values(`${VerticsCityLabel.NAME}`)).
                by(__.select("restaurant").out(`${Edges.WITHIN}`).outE(`${Edges.WITHIN}`).otherV().values(`${VerticsCityLabel.NAME}`)).
                by(__.coalesce(
                    __.select("restaurant").in_(`${Edges.ABOUT}`).values(`${VerticsReviewLabel.RATING}`).mean(),
                    __.constant(0)
                    )
                    ).
                    by( __.select("restaurant").outE(`${Edges.SERVES}`).otherV().values(`${VerticsCuisineLabel.CUISINE_NAME}`)).
                by(__.select("restaurant").label()).
                order().by(
                    `${RestaurantReturn.rating}`, order.desc
                ).
                limit(1).
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


    } catch (err) {
        console.log("ERROR", err)
        return null
    }


}

