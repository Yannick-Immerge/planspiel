"use client"
import {Resource} from "@/app/api/models";
import ResourceComponent from "@/app/components/ResourceComponent";
import CollapsingCard from "@/app/components/CollapsingCard";

export default function ResourceListComponent({resourceEntries, collapsible, heading} : {resourceEntries: Resource[], collapsible: boolean, heading: string}) {
    const produceItems = () => (
        <div>
            {resourceEntries.map((item, index) => (
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