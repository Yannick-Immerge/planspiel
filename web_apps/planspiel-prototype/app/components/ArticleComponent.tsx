import {useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";


export default function ArticleComponent({ path } : { path: string}) {
    const [markdown, setMarkdown] = useState("");
    useEffect(() => {
        const fetchMarkdown = async () => {
            const response = await fetch(`${path}`);
            setMarkdown(await response.text());
        };
        fetchMarkdown();
    }, []);

    return (
        <div className="flex justify-center">
            <div className="w-8/12 max-md:w-full bg-gray-300 rounded-md">
                <div
                    className="p-4 border border-gray-300 rounded-md overflow-auto"
                    style={{
                        backgroundImage: "url('/visualization/newspaper_bg.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: "center"
                    }}
                >
                    <div className="prose max-w-none text-lg text-black">
                        <ReactMarkdown>{markdown}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    )
}
