export default function CardView({title, top_right, children} : { title: string, top_right?: string | undefined, children: React.ReactNode }) {
    return (
        <div className="relative max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg border border-gray-200">
            <span className="absolute top-4 right-4 text-md text-gray-400 font-mono">
                {top_right}
            </span>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}