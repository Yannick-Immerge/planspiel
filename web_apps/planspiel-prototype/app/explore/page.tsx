import {get_all_role_names, get_roles_with_name} from "@/app/data/queries";
import Link from "next/link";

export default async function ExplorePage() {
    const role_names = await get_all_role_names();
    return (
        <div>
            <ul>
                {role_names.map(async (role_name) => {
                    const role_objects = await get_roles_with_name(role_name);
                    return (
                        <li key={role_name}>
                            Roles with name {role_name}:
                            <ul>
                                {role_objects.map((role_object) => {
                                    return (
                                        <li key={role_object.id}>
                                            <Link href={`/explore/roles/${role_object.id}`}>Role with id: {role_object.id}</Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </li>
                    )
                })}
                <li>

                </li>
            </ul>
        </div>
    );
}