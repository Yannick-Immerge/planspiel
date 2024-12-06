import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import React from 'react'
import { PointOfInterest } from '../page';

const CustomMarker = (props: {poi: PointOfInterest}) => {

    const iconSize = 64;

    const homeIcon = L.divIcon({
        html:`<div style="font-size: ${iconSize*0.5}px; line-height: ${iconSize}px">${props.poi.icon}</div>`, 
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize/2, iconSize],
        popupAnchor: [0, -iconSize],
    });

    
  return (
    <Marker
            key={props.poi.id}
            icon={homeIcon}
            position={[props.poi.pos.lat, props.poi.pos.lng]}
            draggable={false}
        >
            <Popup>{props.poi.description}</Popup>
    </Marker>
  )
}

export default CustomMarker
