import { Post } from "@/app/api/models";
import MarkdownComponent from "./DiaryComponent";
import { useState } from "react";


export default function PostComponent({ post } : { post: Post}) {
    const [showingTranslated, showTranslated] = useState<boolean>(false);
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
    <div className={postFormat + " " + "bg-stone-200 b-l-8 border-solid p-5"}>
        <div>{descText}</div>
        <MarkdownComponent path={showingTranslated? post.textDeIdentifier : post.textOrigIdentifier}/>
        
    </div>)
}