export default function AttributeView({ attr }: { attr: { name: string; text: string }[] }) {
    return (
        <div className="space-y-4">
            {attr.map((v, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 items-start">
                    <span className="font-semibold text-gray-700">{v.name}:</span>
                    <span className="text-gray-600">{v.text}</span>
                </div>
            ))}
        </div>
    );
}