"use client"
import {RoleMetadata} from "@/app/api/models";

export default function MetadataComponent({metadata} : {metadata: RoleMetadata}) {
    return (
        <div className="text-lg">
            <h1 className=" text-3xl text-center text-decoration-line: underline">{metadata.name}</h1>
            <ul>
                <li><span className="font-bold">Alter: </span>{metadata.age}</li>
                <li><span className="font-bold">Größe: </span>{metadata.height}cm</li>
                <li><span className="font-bold">Nationalität: </span>{metadata.nationality}</li>
                <li><span className="font-bold">Adresse: </span>{metadata.address}</li>
            </ul>
        </div>
    );
}