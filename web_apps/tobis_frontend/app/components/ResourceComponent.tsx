import {Resource} from "@/app/api/models";
import Image from "next/image";
import ReactMarkdown from "react-markdown"

export default async function ResourceComponent({ resource } : { resource: Resource}) {
    let comp = undefined;
    switch(resource.contentType) {
        case "article":
            comp = (
                <ArticleComponent path={`/resources/${resource.identifier}`}/>
            )
        case "diary":
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

function PictureComponent({ path }: { path: string }) {
    return (
        <div>
            <Image src={path} alt={`Image: ${path}`} width={100} height={100}/>
        </div>
    )
}

async function ArticleComponent({ path } : { path: string}) {
    const response = await fetch(`http://${path}`);
    const text = await response.text();
    return (
        <div>
            <ReactMarkdown>{text}</ReactMarkdown>
        </div>
    )
}