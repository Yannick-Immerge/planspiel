import { Resource } from "@/app/api/models";
import ArticleComponent from "./ArticleComponent";
import DiaryComponent from "./DiaryComponent";
import PictureComponent from "./PictureComponent";


export default function ResourceComponent({ resource } : { resource: Resource}) {
    let comp = undefined;
    switch(resource.contentType) {
        case "article":
            comp = (
                <div  className="border-l-8 border-solid border-amber-700 bg-gray-300 m-auto w-[90%] rounded-2xl text-xs">
                    <ArticleComponent pathimage={undefined} path={`/resources/${resource.identifier}`}/>
                </div>
            )
            break;
        case "diary":
            comp = (
                <div  className="p-2 bg-stone-800 m-auto w-[90%] rounded-2xl text-xs">
                <DiaryComponent path={`/resources/${resource.identifier}`}/>
                </div>
            )
            break;
        case "picture":
            comp = (
                <PictureComponent path={`/resources/${resource.identifier}`}/>
            )
            break;
        case "info":
            comp = (
                <div  className="border-l-8 mt-4 border-solid border-stone-800 bg-gray-300 m-auto w-[90%] rounded-2xl text-xs">
                    <ArticleComponent pathimage={undefined} path={`/resources/${resource.identifier}`}/>
                </div>
            )

    }
    // TODO: Temporary
    if(comp === undefined) {
        comp = (
            <ArticleComponent pathimage={undefined} path={`/resources/${resource.identifier}`}/>
        );
    }
    return <div>
        {comp === undefined ? <p>Unknown resource content-type: {resource.contentType}</p> : comp}
    </div>
}