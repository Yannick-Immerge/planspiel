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
    const [fullText, showMore] = useState<boolean>(false)
    useEffect(() => {
        const fetchMarkdown = async () => {
            const responseOrig = await fetch(`${pathOrig}`);
            setMarkdownOrig(await responseOrig.text());
            const responseDE = await fetch(`${pathDE}`);
            setMarkdownDE(await responseDE.text());
        };
        fetchMarkdown();
    }, []);

    let anzeigeText : string = ""
    let addition = "";

    if (showDE && fullText || (showDE && markdownDE.length<200)) {
        anzeigeText = markdownDE
        addition = markdownDE.length<200 ? "" : "Weniger anzeigen";
    } else if (showDE) {
        anzeigeText = markdownDE.substring(0, 200) + "...";
        addition = "Mehr anzeigen"
    } else if (!showDE && fullText || (!showDE && markdownOrig.length<200)) {
        anzeigeText = markdownOrig
        addition = markdownOrig.length<200 ? "" : "Weniger anzeigen";
    } else {
        anzeigeText = markdownOrig.substring(0, 200) + "...";
        addition = "Mehr anzeigen"
    }

    return (
        <div className="w-full h-full text-sm text-black">
            <ReactMarkdown>{anzeigeText}</ReactMarkdown>
            <div onClick={() => showMore(!fullText)} className="pt-2 underline cursor-pointer">{addition}</div>
        </div>
    )
}
