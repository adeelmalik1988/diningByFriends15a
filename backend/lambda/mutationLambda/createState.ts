import * as gremlin from "gremlin"
import { Vertics, VerticsStateLabel } from "./MutationTypes"
import { nanoid } from "nanoid"



const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_WRITER

export default async function createState(stateName: String) {

    const addState = {
        state_id: nanoid(10),
        state_name: stateName,

    }

    //let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    let dc = new DriverRemoteConnection(`ws://${uri}/gremlin`)


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