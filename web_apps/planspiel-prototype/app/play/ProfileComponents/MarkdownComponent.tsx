import {useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";



export default function MarkdownComponent({ path } : { path: string}) {
    const [markdown, setMarkdown] = useState("");
    useEffect(() => {
        const fetchMarkdown = async () => {
            const response = await fetch(`${path}`);
            setMarkdown(await response.text());
        };
        fetchMarkdown();
    }, []);

    return (
        <div className="w-full h-full text-sm prose text-black">
            <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
    )
}

export function TranslatableMarkdownComponent({ pathDE, pathOrig, showDE } : { pathDE: string, pathOrig: string, showDE: boolean}) {
    const [markdownOrig, setMarkdownOrig] = useState("");
    const [markdownDE, setMarkdownDE] = useState("");

    useEffect(() => {
        const fetchMarkdown = async () => {
            const responseOrig = await fetch(`${pathOrig}`);
            setMarkdownOrig(await responseOrig.text());
            const responseDE = await fetch(`${pathDE}`);
            setMarkdownDE(await responseDE.text());
        };
        fetchMarkdown();
    }, []);

    return (
        <div className="w-full h-full text-sm prose text-black">
            <ReactMarkdown>{showDE? markdownDE : markdownOrig}</ReactMarkdown>
        </div>
    )
}
