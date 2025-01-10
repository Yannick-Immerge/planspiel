import { Post, RoleMetadata } from "@/app/api/models";
import MarkdownComponent, { TranslatableMarkdownComponent } from "./MarkdownComponent";
import { useState } from "react";


export default function PostComponent({ post, roleMetadata } : { post: Post, roleMetadata: RoleMetadata}) {
    const [showDE, setShowDE] = useState<boolean>(false);
    let comp = undefined;

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
    <div className={postFormat + " " + "bg-stone-200 m-5 b-l-8 rounded-2xl border-solid p-5"}>
        <div>{descText}</div>
        <div>{showDE? ("Übersetzt von: " + roleMetadata.language) : ""}</div>
        <div onClick={() => setShowDE(!showDE)} className="rounded-xl text-decoration-line: underline">{showDE? "Original anzeigen" : "Übersetzen"}</div>
        
        <TranslatableMarkdownComponent pathDE={post.textDeIdentifier} pathOrig={post.textOrigIdentifier} showDE={showDE} />
        
    </div>)
}