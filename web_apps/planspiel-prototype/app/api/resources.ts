import {Resource, RoleMetadata} from "@/app/api/models";

export async function loadMetadataResource(resource: Resource) : Promise<RoleMetadata | null> {
    if(resource.contentType !== "metadata") {
        return null;
    }
    try {
        const response = await fetch(`/resources/${resource.identifier}`);
        return await response.json();
    } catch {
        return null;
    }
}