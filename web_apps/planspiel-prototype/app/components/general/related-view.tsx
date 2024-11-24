import Link from "next/link";

export default function RelatedView({ name, rel }: { name: string, rel: { href: string; text: string }[] }) {
    return (
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{name}</h2>
            <ul className="space-y-2">
                {rel.map((v, index) => (
                    <li key={index}>
                        <Link
                            href={v.href}
                            className="text-blue-600 hover:text-blue-800 transition-colors underline"
                        >
                            {v.text}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}