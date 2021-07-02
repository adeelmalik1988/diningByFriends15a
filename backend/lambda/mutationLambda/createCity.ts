import * as gremlin from "gremlin"
import { Edges, Vertics, VerticsCityLabel, VerticsStateLabel, CityInput } from "./MutationTypes"
import { nanoid } from "nanoid"



const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph
const uri = process.env.NEPTUNE_WRITER

export default async function createCity(cityDetail: CityInput) {

    const addCity = {
        city_id: nanoid(10),
        city_name: cityDetail.cityName,
        state_id: cityDetail.stateId

    }

    //let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {})
    let dc = new DriverRemoteConnection(`ws://${uri}/gremlin`)


    const graph = new Graph()
    const g = graph.traversal().withRemote(dc)
    const __ = gremlin.process.statics
    //restaurant_id --(within)-> city --(within)--> state
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
        return null
    }


}