import { GetGermanName } from '@/app/dashboard/BuergerraeteArea';
import React from 'react'

const EMailComponent = ({nachname, themen} : {nachname: string, themen: string[]}) => {
  return (
    <div className="text-sm boder-solid border-stone-800 bg-sky-100 text-slate-800 p-5 rounded-xl" style={{borderWidth: "3px"}}>
        <div className="pb-2">{GetAnrede({nachname})},</div>
        <div className="py-2">im Rahmen der Bürgerratsinitiative für mehr Demokratie und im Namen der Vereinten Nationen lade ich Sie hiermit herzlichst ein, einem anstehenden Bürgerrat in München, Deutschland beizuwohnen. Hier beteiligen Sie sich im Austausch mit anderen an einem Statement welches sich an die Vereinten Nationen richtet. Der Bürgerrat beschäftigt sich mit folgenden Punkten, die Sie selbstverständlich auch mit betreffen:</div>
            {themen? <div className="pl-5">{themen?.map((n, index) => <li key={index}>{GetGermanName(n)}</li>)}</div> : <></>}

        <div className="py-2">Sämtliche Kosten für An- und Abreise werden selbstverständlich übernommen.</div>
        <div className="py-2">Ihre Meinung zu diesem Thema ist für uns von unschätzbarem Wert und wir freuen uns sehr auf ihr Kommen.</div>
        <div className="py-2">Mit freundlichen Grüßen</div>
        <div className="pt-2">Anatoli Burkman</div>
        <div className="">Schriftführer der "Mehr Demokratie GmbH"</div>
    </div>
  )
}

function GetAnrede({nachname}: {nachname:string}) : string {
    if (
        nachname == "Miller" ||
        nachname == "Davis" ||
        nachname == "Schulz" ||
        nachname == "Pedersen" ||
        nachname == "Silva" ||
        nachname == "Owusu") return "Sehr geehrter Herr " + nachname
    else return "Sehr geehrte Frau " + nachname;
}

export default EMailComponent
