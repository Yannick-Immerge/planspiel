"use client"
import {Resource} from "@/app/api/models";
import ResourceComponent from "@/app/components/ResourceComponent";

export default function ResourceListComponent({resourceEntries} : {resourceEntries: Resource[]}) {
    return (
        <div>
            {resourceEntries.map((item, index) => (
                <ResourceComponent key={index} resource={item}/>
            ))}
        </div>
    );
}