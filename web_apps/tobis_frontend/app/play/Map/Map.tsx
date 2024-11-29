'use client'

import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { FaHome } from "react-icons/fa"
import * as L from 'leaflet'
import CustomMarker from './CustomMarker'
import { Coordinates, PointOfInterest } from './../page'

export default function CustomMap(props: {center: Coordinates, living: PointOfInterest, poi: PointOfInterest[] | []}) {
  return (
    <MapContainer center={props.center} zoom={10} scrollWheelZoom={true}>
        <TileLayer
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" 
            attribution='&copy; <a href=http://osm.org/copyright">OpenStreetMap</> contributors'
        />
        <CustomMarker id={props.living.id} pos={props.living.pos} description={props.living.description} icon={props.living.icon}/>
        {props.poi.map((n) => <CustomMarker id={n.id} pos={n.pos} icon={n.icon} description={n.description}/>)}
    </MapContainer>
  )
}