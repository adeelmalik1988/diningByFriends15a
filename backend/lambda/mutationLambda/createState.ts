//import * as gremlin from "gremlin"
import { structure, process as gprocess , driver } from './gremlinReturnConversion'
import { Vertics, VerticsStateLabel } from "./MutationTypes"
import { nanoid } from "nanoid"

declare var process: {
    env: {

        NEPTUNE_WRITER: string,
        NEPTUNE_PORT: string
    }
}


const DriverRemoteConnection = driver.DriverRemoteConnection
const Graph = structure.Graph
//let conn = gremlin.driver.DriverRemoteConnection
//let g = gremlin.process.GraphTraversalSource

const uri = process.env.NEPTUNE_WRITER

type stateDetail = {
    stateName: String
}

export default async function createState(stateDetail: stateDetail) {

    // const getConnectionDetails = () => {
    //     const database_url = 'wss://' + process.env.NEPTUNE_WRITER + ':8182/gremlin';
    //     return {
    //         url: database_url, headers: {}
    //     }
    // }

    // const createRemoteConnection = () => {
    //     const { url, headers } = getConnectionDetails();
        
    //     console.log('database_url', url)
    //     return new DriverRemoteConnection(
    //         url, 
    //         { 
    //             mimeType: 'application/vnd.gremlin-v2.0+json', 
    //             pingEnabled: false,
    //             headers: headers 
    //         });       
    // };
    console.log('NEPTUNE_WRITER', process.env.NEPTUNE_WRITER)
    console.log('NEPTUNE_PORT', process.env.NEPTUNE_PORT)



    const addState = {
        state_id: nanoid(10),
        state_name: stateDetail.stateName

    }

    console.log('addState :', addState)

    //let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    //let dc = new DriverRemoteConnection(`ws://${uri}/gremlin`)
    let dc = new DriverRemoteConnection(`wss://${process.env.NEPTUNE_WRITER}:${process.env.NEPTUNE_PORT}/gremlin`, {
        MimeType: 'application/vnd.gremlin-v2.0+json',
        Headers: {},
    })

    // const createGraphTraversalResource = (conn: gremlin.driver.DriverRemoteConnection) => {
    //     return gremlin.process.traversal().withRemote(conn)

    // }
    
    // if (conn == null){
    //     conn = createRemoteConnection();
    //     g = createGraphTraversalResource(conn)

    // }


    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    //restaurant_id --(within)-> city --(within)--> state
    try {
        let data = await g.addV(`${Vertics.STATE}`).
            property(`${VerticsStateLabel.STATE_ID}`, addState.state_id).
            property(`${VerticsStateLabel.NAME}`, addState.state_name).
            next()
        //let vertices = Array()

        // for (const v of data) {
        //     const _properties = await g.V(v.id).properties().toList()

        //     let post = _properties.reduce((acc, next)=>{
        //         acc[next.label] = next.value
        //     })
        // }
        dc.close()
        console.log("State Added", data)



        return data


    } catch (err) {
        console.log("ERROR", err)
        return null
    }


}