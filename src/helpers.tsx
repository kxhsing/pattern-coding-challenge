// @ts-ignore
import { EventData } from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax
import { geoData } from './constants';


export const getCountryOptions = () =>{
    // @ts-ignore
    const returnData = geoData.features.map(feature =>{
        return { 'label': feature.properties.ADMIN, 'value': feature.properties.ISO_A3 }
    })
    return returnData
}
 
export const getEarthquakePopupHTML = (eventFeatures: EventData): string =>{
    const properties = eventFeatures.properties
    return (
        `<div>
            <div><a href=${properties.url} target='new'>${properties.title}</a></div>
            <div>Time: ${new Date(properties.time)}
            <div>Magnitude: ${properties.mag}</div>
            <div>Coordinates: Lat: ${eventFeatures.geometry.coordinates[1]} Lng: ${eventFeatures.geometry.coordinates[0]}</div>
        </div>`
    )
}

