"use client"
import {Resource} from "@/app/api/models";
import ResourceComponent from "@/app/components/ResourceComponent";
import CollapsingCard from "@/app/components/CollapsingCard";

export default function ResourceListComponent({resourceEntries, collapsible, heading, avoid} : {resourceEntries: Resource[], collapsible: boolean, heading: string, avoid: string}) {
    const produceItems = () => (
        <div>
            {resourceEntries.filter((n) => n.identifier != avoid).map((item, index) => (
                <div key={index}>
                    <ResourceComponent resource={item}/>
                    <div className="h-2"></div>
                </div>
            ))}
        </div>
    )

    return collapsible ? (
        <CollapsingCard heading={heading}>
            {produceItems()}
        </CollapsingCard>
    ) : produceItems();
}