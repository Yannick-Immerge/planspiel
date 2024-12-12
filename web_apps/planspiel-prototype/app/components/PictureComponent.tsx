export default function PictureComponent({ path }: { path: string }) {
    return (
        <div className="w-100 flex justify-center">
            <div
                className="w-80 h-80 p-4 border border-gray-300 rounded-md overflow-auto"
                style={{backgroundImage: `url(${path})`, backgroundSize: 'cover', backgroundPosition: "center"}}
            ></div>
        </div>
    )
}