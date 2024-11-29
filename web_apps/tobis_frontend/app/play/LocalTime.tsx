import React from 'react'
import { Coordinates } from './page'
import { TbSunset, TbSunrise, TbSun, TbMoon } from "react-icons/tb"
import { LuMoonStar, LuSunrise, LuSunset, LuSun } from "react-icons/lu"
import { PiX } from 'react-icons/pi';

const LocalTime = (props: {timeZone: string}) => {
    
    const time = new Date().toLocaleTimeString("de", {timeZone: props.timeZone});


    var icon = <TbSunrise />
    var foreground = "#ff00ff";
    var boxShadow: string = "";
    //var numHour = time.getHours();
    //var numMinutes = time.getMinutes();
    var parts: string[] = time.split(':');
    var numMinutes = Number(parts[1]);
    var numHour = Number(parts[0]);



    if ((numHour >= 4 && numHour < 8) || (numHour >=18 && numHour < 20)) {
        foreground = "#E2825F"
        icon = numHour > 12? <LuSunset color={foreground} className="m-auto"/> : <LuSunrise color={foreground} className="m-auto"/>
        boxShadow = "shadow-[inset_0_-2px_8px_rgba(243,80,15,1.0)] bg-[#174962]"
    } else if (numHour >=8 && numHour < 18) {
        foreground = "#F3AF1F"
        icon = <LuSun color={foreground}className="m-auto"/>
        boxShadow = "shadow-[inset_0_0px_8px_rgba(243,175,31,1.0)] bg-transparent"
    } else {
        foreground = "#ffffff"
        icon = <LuMoonStar color={foreground}className="m-auto"/>
        boxShadow = "shadow-[inset_0_-2px_8px_rgba(97,57,158,1.0)] bg-[#333333]"
    }

  return (
    <div className={boxShadow + " " + "flex rounded-full pl-3 pr-3 pt-1 pb-1 m-auto"}>
      {icon}
      <div className="pl-1" style={{color: foreground}}>{numHour<10? "0" : ""}{numHour}:{numMinutes<10? "0" : ""}{numMinutes}</div>
      <div className='pl-2 text-xs m-auto' style={{color: foreground}}>({props.timeZone.split('/')[1].replace('_', " ")})</div>
    </div>
   )
}

export default LocalTime
