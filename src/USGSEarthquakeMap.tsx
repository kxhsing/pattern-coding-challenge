import React, { useRef, useEffect, useState } from 'react';
import './USGSEarthquakeMap.css';
import { getEarthquakePopupHTML, getCountryOptions } from './helpers';
import { accessToken, geoData } from './constants';
import * as Turf from '@turf/turf';

// @ts-ignore
import mapboxgl, { Map, MapboxEvent } from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
// @ts-ignore
import countriesData from './data/countries.geojson'
// @ts-ignore
import earthquakesData from './data/earthquakes.geojson'

mapboxgl.accessToken = accessToken


function USGSEarthquakeMap(){
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const [lng, setLng] = useState(-70.9);
    const [lat, setLat] = useState(42.35);
    const [zoom, setZoom] = useState(2);
    
    const countryOptions = [{'label': 'All', 'value': ''}, ...getCountryOptions()]

    useEffect(() => {
        const map: Map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          projection: 'globe',
          center: [lng, lat],
          zoom: zoom
        });

        map.on('load', () => {
          map.addSource('countries', {
            type: 'geojson',
            data: countriesData
            });

          map.addSource('earthquakes', {
          type: 'geojson',
          data: earthquakesData
          });

          map.addLayer({
            'id': 'countries',
            'type': 'fill',
            'source': 'countries',
            'paint': {
              'fill-color': 'purple',
              'fill-opacity': 0.5
              }
          });
          map.addLayer({
            'id': 'countries-outline',
            'type': 'line',
            'source': 'countries',
            'paint': {
              'line-color': '#000',
              'line-width': 0.5
              },

          });

          map.addLayer({
            'id': 'earthquakes',
            'type': 'circle',
            'source': 'earthquakes',
            'paint': {
            'circle-radius': 4,
            'circle-stroke-width': 2,
            'circle-color': 'red',
            'circle-stroke-color': 'white'
            }
          });

          // Change the cursor to a pointer when the mouse is over the places layer.
          map.on('mouseenter', 'earthquakes', () => {
            map.getCanvas().style.cursor = 'pointer';
            });
            
          // Change it back to a pointer when it leaves.
          map.on('mouseleave', 'earthquakes', () => {
          map.getCanvas().style.cursor = '';
          });

          map.on('click', 'earthquakes', (e: MapboxEvent) => {
            const features = e.features[0]
            // Copy coordinates array.
            const coordinates = features.geometry.coordinates.slice();
             
            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
             
            new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(getEarthquakePopupHTML(features))
            .addTo(map);
          });

          filterElem!.onchange = () => {
            // @ts-ignore
            const newCountry: string = filterElem.value;
            const newGeoJSON = {...geoData };

            if (!newCountry){
              map.setFilter('earthquakes',null);
              map.setFilter('countries',null);
              map.setFilter('countries-outline',null);
              newGeoJSON.features = [...geoData.features];
              map.getSource('countries').setData(newGeoJSON);
              return
            }
            
            // @ts-ignore
            const newCountryData = newGeoJSON.features.find(feature => feature.properties.ISO_A3 == newCountry)
            const newCountryCoordinates = newCountryData.geometry.coordinates
            // @ts-ignore
            newGeoJSON.features = geoData.features.filter(feature => feature.properties.ISO_A3 === newCountry);
            
            // calculate region for filtering and center coordinates to move map to 
            const newCountryRegion = newCountryData.geometry.type === 'MultiPolygon' ? Turf.multiPolygon(newCountryCoordinates) : Turf.polygon(newCountryCoordinates) 
            const centroid = Turf.centroid(newCountryRegion);
            const centerCoordinates = centroid.geometry.coordinates;
            map.flyTo({
              center: centerCoordinates,
              zoom: 4,
              essential: true // this animation is considered essential with respect to prefers-reduced-motion
              });
            map.setFilter(
              "earthquakes",
              ["within", newCountryRegion]
            );
            map.getSource('countries').setData(newGeoJSON);
          };
        });

        
        // Add each country as an option to filter for Earthquake data
        const filterElem = document.getElementById('countryFilter');
        countryOptions.forEach(country => {
          const opt = document.createElement('option');
          opt.value = country.value;
          opt.innerText = country.label; 
          filterElem!.appendChild(opt);
        });
      }, []);

    return (
        <div className='usgs-earthquake-map'>
            <div ref={mapContainer} className='map-container'/>
            <div>
            <select id='countryFilter' name='countryFilter'>
              <option value=''>Select Country</option>
              
            </select>
            </div>
        </div>
    )
}
export default USGSEarthquakeMap