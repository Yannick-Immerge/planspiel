import {Resource} from "@/app/api/models";
import PictureComponent from "@/app/components/PictureComponent";
import ArticleComponent from "@/app/components/ArticleComponent";
import DiaryComponent from "@/app/components/DiaryComponent";

export default function ResourceComponent({ resource } : { resource: Resource}) {
    let comp = undefined;
    switch(resource.contentType) {
        case "article":
            comp = (
                <ArticleComponent path={`/resources/${resource.identifier}`}/>
            )
            break;
        case "diary":
            comp = (
                <DiaryComponent path={`/resources/${resource.identifier}`}/>
            )
            break;
        case "picture":
            comp = (
                <PictureComponent path={`/resources/${resource.identifier}`}/>
            )
            break;
    }
    return <div>
        {comp === undefined ? <p>Unknown resource content-type: {resource.contentType}</p> : comp}
    </div>
}