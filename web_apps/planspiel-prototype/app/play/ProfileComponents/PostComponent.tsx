import { Post, RoleMetadata } from "@/app/api/models";
import MarkdownComponent, { TranslatableMarkdownComponent } from "./MarkdownComponent";
import { useState } from "react";


export default function PostComponent({ post, roleMetadata } : { post: Post, roleMetadata: RoleMetadata}) {
    const [showDE, setShowDE] = useState<boolean>(false);

    let postFormat : string = "";
    let postBg : string = "bg-stone-200";
    let descText : string = ""
    let descPrefix : string = ""

    switch (post.type) {
        case "by_me":
            postFormat += "border-sky-700"
            descText = "Ein kürzlicher Post von dir:"
            break;
        case "got_tagged":
            postFormat += "border-amber-700"
            descText = `${post.author} hat dich markiert`
            break;
        case "i_liked":
            postFormat += "border-slate-700"
            descText = "Du hast auf diesen Post mit 👍🏼 reagiert"
            break;
    }
    if (post.isScenario) {
        descPrefix = "Aktuell: ";
        postBg = "bg-[#ffcdadff]";
    }


    return (
    <div className={postFormat + " " + postBg + " " + "m-auto b-l-8 py-1 rounded-2xl shadow-[0px_10px_30px_rgba(0,0,0,0.5)] max-w-[500px] text-slate-900 border-solid"} style={{"borderLeftWidth": "0px"}}>
        <div className="text-[#0000009b] m-3"><span className="text-[#7530059b] font-bold m-3">{descPrefix}</span>{descText}</div>
        {  // TODO: image identifiers are empty when using the backend!!! no image is being displayed
           post.imageIdentifiers.length > 0 ? 
            <div className="w-[100%] m-auto aspect-square shadow-[inset_0px_0px_20px_0px_rgba(1,1,1,1.0)]">
                <div style={{"backgroundImage": `url(${post.imageIdentifiers[0]}`}} className="m-auto w-full h-full bg-cover"/>
            </div>
        : ""}
        <div className="mt-3 mx-3 select-none text-stone-500 text-xs">{showDE? (roleMetadata.language? ("Übersetzt von: " + roleMetadata.language) : "Auf Deutsch übersetzt") : ""}</div>
        <div onClick={() => setShowDE(!showDE)} className="mx-3 mb-3 text-stone-700 text-xs text-decoration-line: underline cursor-pointer select-none">{showDE? "Original anzeigen" : "Übersetzen"}</div>
        <div className="m-3">
        <TranslatableMarkdownComponent pathDE={post.textDeIdentifier} pathOrig={post.textOrigIdentifier} showDE={showDE} />
        </div>
        <div className="rounded-xl" style={{"backgroundImage": "url("  + post.imageIdentifiers[0] + ")"}}></div>
    </div>)
}
