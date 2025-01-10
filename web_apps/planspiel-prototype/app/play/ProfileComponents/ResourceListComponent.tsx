import { Resource } from "@/app/api/models";
import CollapsingCard from "@/app/components/CollapsingCard";
import PostComponent from "./PostComponent";


export default function ResourceListComponent({resourceEntries, collapsible, heading, avoid} : {resourceEntries: Resource[], collapsible: boolean, heading: string, avoid: string}) {
    const produceItems = () => (
        <div>
            {resourceEntries.filter((n) => n.identifier != avoid).map((item, index) => (
                <div key={index}>
                    <PostComponent resource={item}/>
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