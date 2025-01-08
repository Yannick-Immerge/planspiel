import {useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";


export default function ArticleComponent({ path, pathimage } : { path: string, pathimage: string | undefined}) {
    const [markdown, setMarkdown] = useState("");
    useEffect(() => {
        const fetchMarkdown = async () => {
            const response = await fetch(`${path}`);
            setMarkdown(await response.text());
        };
        fetchMarkdown();
    }, []);

    return (
        <div className="flex justify-center w-full ">
            {pathimage? <div className="w-1/3" style={{backgroundImage: `url(${pathimage})`}}></div> : <></>}
                <div
                    className="p-4 overflow-auto"

                >
                    <div className="prose max-w-none text-sm text-black">
                        <ReactMarkdown>{markdown}</ReactMarkdown>
                    </div>
                </div>
            
        </div>
    )
}
