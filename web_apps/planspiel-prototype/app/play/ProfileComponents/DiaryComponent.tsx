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
