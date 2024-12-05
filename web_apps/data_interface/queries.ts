import { pool } from './interface';
import {RowDataPacket} from "mysql2";

export interface Role {
    id: number;
    name: string;
    description: string;
    scenarios: Scenario[];
}

export interface Scenario {
    id: number;
    type: "picture" | "article";
    text_content: string | null;
    binary_content: Buffer | null;
}

export async function get_all_role_names(): Promise<string[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT DISTINCT name FROM RoleTable;');
    return rows.map(row => {
        return row.name;
    });
}

export async function get_all_scenarios_for_role_id(role_id: number): Promise<Scenario[]> {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT id, text_content, binary_content FROM ScenarioTable WHERE belongs_to=${role_id}`);

    // @ts-ignore
    return rows;
}

export async function create_roles_with_scenarios(items : {id: number, name: string, description: string}[]) : Promise<Role[]> {
    let res = [];
    for (const item of items) {
        const item_scenarios = await get_all_scenarios_for_role_id(item.id);
        res.push({
            id: item.id,
            name: item.name,
            description: item.description,
            scenarios: item_scenarios
        });
    }
    return res;
}

export async function get_all_roles(): Promise<Role[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name, description FROM RoleTable;');

    // @ts-ignore
    return create_roles_with_scenarios(rows);
}

export async function get_roles_with_name(name: string): Promise<Role[]> {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT id, name, description FROM RoleTable WHERE name = "${name}";`);

    // @ts-ignore
    return create_roles_with_scenarios(rows);
}

export async function get_role_with_id(id: number): Promise<Role | undefined> {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT id, name, description FROM RoleTable WHERE id = ${id};`);
    if (rows.length === 0) {
        return undefined;
    }
    // @ts-ignore
    return (await create_roles_with_scenarios(rows))[0];
}

export async function get_scenario_with_id(id: number): Promise<Scenario | undefined> {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT id, type, text_content, binary_content FROM ScenarioTable WHERE id = ${id};`);
    if (rows.length === 0) {
        return undefined;
    }
    // @ts-ignore
    return rows[0];
}