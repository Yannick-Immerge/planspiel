import {get_role_with_id} from "@/app/data/queries";
import RoleView from "@/app/components/data/role-view";
import ErrorView from "@/app/components/general/error-view";

export default async function RolePage({ params }: { params: Promise<{id: string}>}) {
    const { id } = await params;
    const role = await get_role_with_id(parseInt(id));
    return typeof(role) === "undefined" ? (
        <ErrorView errname="Unknown Role ID" errdesc={`There is no role with id #${id}.`} />
    ) : (
        <RoleView role={role}/>
    );
}