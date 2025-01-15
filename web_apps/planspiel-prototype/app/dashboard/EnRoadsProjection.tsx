"use client";

export default function EnRoadsProjection(props: { enRoadsURL: string | null}) {
    return props.enRoadsURL ? <div>
        <div className="h-8"></div>
        Die Projektionen der EN-ROADS sind hier verfügbar:
        <div className="h-2"></div>
        <button className="align-middle m-auto w-full px-6 py-3 bg-sky-500 text-white font-semibold rounded-md shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition ease-in-out duration-300">
            <a href={props.enRoadsURL ? props.enRoadsURL : ""} target="_blank" rel="noopener noreferrer"> EN-ROADS Projektion ➜</a>
        </button>
    </div> : <div></div>
}
