import { userInfo } from 'os'
import React from 'react'

export const ConfigurationPlaceholder = () => {
  return (
    <div className='rounded-2xl w-[50%] m-auto p-5 backdrop-blur-xl shadow-[10px_10px_10px_rgba(0,0,0,0.8)] ml-10 mr-10'>
      <div className="text-2xl">Der Administrator Konfiguriert eure Spielsession...</div>
        <div className="m-auto w-[150px] h-[150px] bg-cover bg-[url(/gifs/ConfigAnim.gif)]"></div>
      <div className="text-2xs">Das kann manchmal ein bisschen dauern...</div>
    </div>
  )
}

export const GetAllEntries = async (username: string) => {
    
}