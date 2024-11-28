'use client'

import React from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import BackgroundWrapper from '../components/BackgroundWrapper'

export default function Custom404() {
    return (<>
        <BackgroundWrapper />
        <div className="blurBox" style={{width: "50%", position: "absolute", left: "25%", top:"10%"}}>
            <div className="drop-shadow text-9xl pt-10 pb-10">404</div>
            <div className="text-3xl pt-10 pb-10">Upsi!</div>
            <div className="text-2xl pt-10 pb-10">Die von dir angefragte Seite existiert leider nicht.</div>
            <a href="../login" className="text-xl pt-10 pb-10 text-decoration-line: underline">Zurück zum login</a>
        </div>
    </>)
}
