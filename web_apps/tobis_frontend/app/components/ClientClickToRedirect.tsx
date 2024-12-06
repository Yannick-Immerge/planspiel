"use client"

import React from 'react'

const ClientClickToRedirect = (props: {text: string, url: string}) => {
  return (
    <button onClick={() => {window.location.replace(props.url)}} className="blurBox w-[40%] ml-10 text-5xl bg-[#ffff] hover:bg-sky-400 active:bg-sky-600 transition-all duration-200">
      {props.text}
    </button>
  )
}

export default ClientClickToRedirect
