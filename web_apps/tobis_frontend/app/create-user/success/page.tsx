import React from 'react'

const page = () => {
  return (
    <div className="bg-cover bg-center bg-no-repeat bg-[url(/images/EarthTint.png)] min-h-screen bg-fixed">
        <div className='blurBox absolute top-[10%] w-[66.66%] left-[16.5%]'>
            <div className="text-2xl">
                Glückwunsch! Du hast erfolgreich einen Account erstellt.
            </div>
            <div className="text-center">
                <div className="pt-10" >
                    <div><a href="/login" className='pl-2 text-decoration-line: underline'>Zurück zum Login</a></div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default page
