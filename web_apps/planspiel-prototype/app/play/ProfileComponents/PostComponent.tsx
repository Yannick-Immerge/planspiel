import { Post, RoleMetadata } from "@/app/api/models";
import MarkdownComponent, { TranslatableMarkdownComponent } from "./MarkdownComponent";
import { useState } from "react";


export default function PostComponent({ post, roleMetadata } : { post: Post, roleMetadata: RoleMetadata}) {
    const [showDE, setShowDE] = useState<boolean>(false);

    let postFormat : string = "";
    let descText : string = ""

    switch (post.type) {
        case "by_me":
            postFormat += "border-sky-700"
            descText = "Posted by You"
            break;
        case "got_tagged":
            postFormat += "border-amber-700"
            descText = "Someone mentioned You"
            break;
        case "i_liked":
            postFormat += "border-slate-700"
            descText = "You liked this post"
            break;
    }

    return (
    <div className={postFormat + " " + "bg-stone-200 m-5 b-l-8 rounded-2xl text-slate-900 border-solid p-5"} style={{"borderWidth": "5px"}}>
        <div>{descText}</div>
        <div className="select-none text-stone-500 text-xs">{showDE? (roleMetadata.language? ("Übersetzt von: " + roleMetadata.language) : "Auf Deutsch übersetzt") : ""}</div>
        <div onClick={() => setShowDE(!showDE)} className="text-stone-700 text-xs text-decoration-line: underline cursor-pointer select-none">{showDE? "Original anzeigen" : "Übersetzen"}</div>
        
        <TranslatableMarkdownComponent pathDE={post.textDeIdentifier} pathOrig={post.textOrigIdentifier} showDE={showDE} />
        <div className="rounded-xl" style={{"backgroundImage": "url("  + post.imageIdentifiers[0] + ")"}}></div>
    </div>)
}