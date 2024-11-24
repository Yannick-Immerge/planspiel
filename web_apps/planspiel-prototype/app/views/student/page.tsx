import { get_all_role_names } from "@/app/data/queries";

export default async function StudentView() {

    const names = await get_all_role_names();

    return (
        <div>
            <p>This is a student view.</p>
            <ul>
                {names.map((name, index) => (
                    <li key={index}>{name}</li>
                ))}
            </ul>
        </div>
    );
}