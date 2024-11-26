export default async function TypedContentView({type, text_content, binary_content} : {type: "article" | "picture", text_content: string | null, binary_content: Buffer | null}) {
    switch (type) {
        case "article":
            return text_content === null ? (
                <div>
                    <p>No text content was provided for this article.</p>
                </div>
            ) : (
                <div>
                    <p>{text_content}</p>
                </div>
            );
        case "picture":
            if(binary_content === null) {
                return (
                    <div>
                        <p>No image data was provided for this picture.</p>
                    </div>
                )
            }
            const base64Image = binary_content.toString("base64");
            const dataUrl = `data:image/png;base64,${base64Image}`;

            return (
                <div>
                    <img src={dataUrl} alt="Loaded from BLOB" className="w-64 h-auto rounded-lg shadow-md" />
                </div>
            );
        default:
            return (
                <div>
                    <p>Unkown Content Type: {type}</p>
                </div>
            )
    }
}