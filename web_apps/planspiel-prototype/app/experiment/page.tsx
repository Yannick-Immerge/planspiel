import ResourceListComponent from "@/app/play/ProfileComponents/ResourceListComponent";
import {Resource} from "@/app/api/models";

export default function Experiment() {
    const entries : Resource[] = [{contentType: "picture", identifier: "0_max_mustermann_picture.png"}, {contentType: "article", identifier: "0_max_mustermann_parents_drown.txt"}, {contentType: "diary", identifier: "0_max_mustermann_diary.txt"}];
    return (
        <div className="flex justify-center">
            <div className="w-1/2">
                <ResourceListComponent resourceEntries={entries} collapsible={true} heading={"My Role Entries"}/>
            </div>
        </div>
    )
}