import {Resource} from "@/app/api/models";
import Image from "next/image";
import ReactMarkdown from "react-markdown"
import {useEffect, useState} from "react";

export default function ResourceComponent({ resource } : { resource: Resource}) {
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

function ArticleComponent({ path } : { path: string}) {
    const [markdown, setMarkdown] = useState("");
    useEffect(() => {
        const fetchMarkdown = async () => {
            const response = await fetch(`${path}`);
            setMarkdown(await response.text());
        };
        fetchMarkdown();
    }, []);

    return (
        <div className="bg-gray-300 rounded-md">
            <div
                className="w-100 p-4 border border-gray-300 rounded-md overflow-auto"
                style={{backgroundImage: "url('/visualization/newspaper_bg.png')"}}
            >
                <div className="prose max-w-none text-lg text-black">
                    <ReactMarkdown>{markdown}</ReactMarkdown>
                </div>
            </div>
        </div>
    )
}