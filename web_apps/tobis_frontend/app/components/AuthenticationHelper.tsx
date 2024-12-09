// Returns an encoded Version of a string
export function Encode(pwd: string) : string {
    return "Verschlüsselt(" + pwd + ")";
}

// Returns a SHA256 Hash of a string
export async function EncodeExp(pwd: string) : Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const suiteSha256 = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(suiteSha256));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}
