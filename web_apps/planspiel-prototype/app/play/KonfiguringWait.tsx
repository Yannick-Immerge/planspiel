export const ConfigurationPlaceholder = ({reason = "loading"} : {reason?: "configuration" | "loading"}) => {
    return (
      <div className='w-[80%] m-auto rounded-2xl p-5 backdrop-blur-xl shadow-[10px_10px_10px_rgba(0,0,0,0.8)]'>

        {reason == "configuration"?
        <div className="text-2xl text-center">Der Administrator Konfiguriert eure Spielsession...</div>
        :
        <div className="text-2xl text-center">Versuche, dein Profil zu laden...</div>
        }
          <div className="m-auto w-[300px] h-[300px] bg-cover bg-[url(/gifs/ConfigAnim.gif)]"></div>
        <div className="text-2xs text-center">Gleich geht's los...</div>
      </div>
    )
}