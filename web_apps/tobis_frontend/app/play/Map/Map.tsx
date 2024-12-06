'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import CustomMarker from './CustomMarker'
import { Coordinates, PointOfInterest } from './../page'

export default function CustomMap(props: {center: Coordinates, living: PointOfInterest, poi: PointOfInterest[] | []}) {
  return (
    <MapContainer key={68} center={props.center} zoom={10} scrollWheelZoom={true}>
        <TileLayer
            key={8}
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" 
            attribution='&copy; <a href=http://osm.org/copyright">OpenStreetMap</> contributors'
        />
        <CustomMarker key={props.living.id} poi={props.living} />

        {props.poi.map((n) => <CustomMarker key={n.id} poi={n} />)}
    </MapContainer>
  )
}