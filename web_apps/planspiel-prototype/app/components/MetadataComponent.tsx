"use client"
import {RoleMetadata} from "@/app/api/models";

export default function MetadataComponent({metadata} : {metadata: RoleMetadata}) {
    return (
        <div className="text-lg">
            <h1 className="text-lg">{metadata.name}</h1>
            <ul>
                <li><span className="font-bold">Age: </span>{metadata.age}</li>
                <li><span className="font-bold">Height: </span>{metadata.height}</li>
                <li><span className="font-bold">Nationality: </span>{metadata.nationality}</li>
                <li><span className="font-bold">Address: </span>{metadata.address}</li>
            </ul>
        </div>
    );
}