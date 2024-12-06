import React from 'react'
import CreateSessionInput from './CreateSessionInput'

const page = () => {
  return (
    <div className="bg-cover bg-center bg-no-repeat bg-[url(/images/EarthTint.png)] min-h-screen bg-fixed">
        <div className="w-[66.66%] ml-[16.5%] mr-[16.5%] pt-10 pb-10">
        <div className="bg-cover bg-center bg-no-repeat bg-[url(/images/EarthTint.png)] min-h-screen bg-fixed">
            <div className="w-[66.66%] ml-[16.5%] mr-[16.5%] pt-10 pb-10">
                <CreateSessionInput />
            </div>
        </div>
        </div>
    </div>
  )
}

export async function TryCreateSession (props: {prodKey: string}) : Promise<string | null> {
    if (!props.prodKey || props.prodKey === "") return null;
    // get session id from prodKey
    return "Globale-Herde-47"
}

export default page
