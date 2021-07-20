//import * as gremlin from "gremlin"
import { structure, process as gprocess , driver } from './gremlinReturnConversion'
import { Edges, Vertics, VerticsCityLabel, VerticsStateLabel, CityInput } from "./MutationTypes"
import { nanoid } from "nanoid"
import * as async from "async"


const DriverRemoteConnection = driver.DriverRemoteConnection
const Graph = structure.Graph
//const uri = process.env.NEPTUNE_WRITER

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


export default async function createCity(cityDetail: CityInput) {

    const addCity = {
        city_id: nanoid(10),
        city_name: cityDetail.cityName,
        state_id: cityDetail.stateId

    }

    console.log('addCity',addCity)

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
    //restaurant_id --(within)-> city --(within)--> state

    // async function query() {
    //     return await g.addV(`${Vertics.CITY}`).
    //         property(`${VerticsCityLabel.CITY_ID}`, addCity.city_id).
    //         property(`${VerticsCityLabel.NAME}`, addCity.city_name).as("addedCity").
    //         addE(`${Edges.WITHIN}`).from_("addedCity").to(__.V().has(`${Vertics.STATE}`,`${VerticsStateLabel.STATE_ID}`,`${addCity.state_id}`)).
    //         iterate();
    // }
    
    // async function doQuery() {
    //     let result = await query(); 
    //     return {
    //         statusCode: 200,
    //         headers: { "Content-Type": "text/plain" },
    //         body: result,
    //       };
    // }



    
    // return async.retry(
    //     { 
    //         times: 5,
    //         interval: 1000,
            
    //     },
    //         function (err: any) { 
                
    //             // Add filters here to determine whether error can be retried
    //             console.warn('Determining whether retriable error: ' + err.message);
                
    //             // Check for connection issues
    //             if (err.message.startsWith('WebSocket is not open')){
    //                 console.warn('Reopening connection');
    //                 dc.close();
    //                 //conn = createRemoteConnection();
    //                 graph.traversal().withRemote(dc);
    //                 return true;
    //             }
                
    //             // Check for ConcurrentModificationException
    //             if (err.message.includes('ConcurrentModificationException')){
    //                 console.warn('Retrying query because of ConcurrentModificationException');
    //                 return true;
    //             }
                
    //             // Check for ReadOnlyViolationException
    //             if (err.message.includes('ReadOnlyViolationException')){
    //                 console.warn('Retrying query because of ReadOnlyViolationException');
    //                 return true;
    //             }
                
    //             return false; 
    //         },
    //     doQuery)

    try {
        let data = await g.addV(`${Vertics.CITY}`).
        property(`${VerticsCityLabel.CITY_ID}`, addCity.city_id).
        property(`${VerticsCityLabel.NAME}`, addCity.city_name).as("addedCity").
        addE(`${Edges.WITHIN}`).from_("addedCity").to(__.V().has(`${Vertics.STATE}`,`${VerticsStateLabel.STATE_ID}`,`${addCity.state_id}`)).
        iterate()
        //let vertices = Array()

        // for (const v of data) {
        //     const _properties = await g.V(v.id).properties().toList()

        //     let post = _properties.reduce((acc, next)=>{
        //         acc[next.label] = next.value
        //     })
        // }
        dc.close()
        console.log("City Added", data)



        return data


    } catch (err) {
        console.log("ERROR", err)
        dc.close()

        return null
    }


}