"use client"

import React from 'react'

const ClientClickToRedirect = (props: {text: string, url: string}) => {
  return (
    <button onClick={() => {window.location.replace(props.url)}} className="shadow-[10px_10px_10px_rgba(0,0,0,0.8)] w-[40%] ml-10 hover:rounded-3xl rounded-2xl backdrop-blur-none hover:backdrop-blur-lg text-5xl bg-[#88b1] hover:bg-sky-400 active:bg-sky-600 transition-all duration-300">
      {props.text}
    </button>
  )
}

export default ClientClickToRedirect
