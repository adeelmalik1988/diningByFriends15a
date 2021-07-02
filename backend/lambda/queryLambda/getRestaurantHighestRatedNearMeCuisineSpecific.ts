import * as gremlin from "gremlin"
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"
import { RestaurantHighestRatedNearMeCuisineSpecificInput } from "./QueryTypes"

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_READER

export default async function GetRestaurantHighestRatedNearMeCuisineSpecific(myIdAndCuisine : RestaurantHighestRatedNearMeCuisineSpecificInput) {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`,{})

    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)

    try {
        let data = await g.V().hasLabel("Person").toList()
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

