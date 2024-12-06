import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import React from 'react'
import { PointOfInterest } from '../page';

const CustomMarker = (props: PointOfInterest) => {

    const iconSize = 64;

    const homeIcon = L.divIcon({
        html:`<div style="font-size: ${iconSize*0.5}px; line-height: ${iconSize}px">${props.icon}</div>`, 
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize/2, iconSize],
        popupAnchor: [0, -iconSize],
    });

    console.log(`I'm ${props.icon} and my ID is ${props.key}`);
  return (
    <Marker
            key={props.key}
            icon={homeIcon}
            position={[props.pos.lat, props.pos.lng]}
            draggable={false}
        >
            <Popup>{props.description}</Popup>
    </Marker>
  )
}

export default CustomMarker
