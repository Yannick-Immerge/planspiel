export default function PictureComponent({ path }: { path: string }) {
    return (
        <div className="w-full flex justify-center">
            <div
                className="h-80 w-80 m-auto border-gray-300 rounded-full overflow-auto"
                style={{backgroundImage: `url(${path})`, backgroundSize: 'cover', backgroundPosition: "center"}}
            ></div>
        </div>
    )
}