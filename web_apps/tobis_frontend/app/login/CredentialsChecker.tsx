interface User {
    id: number;
    username: string;
    address: {
        suite: string
        geo: {
            lat: number
            lng: number
        }
    }
}

class Response<T> {
    constructor(allowed: boolean, value: T | undefined) {
        this.allowed = allowed;
        this.value = value;
    }
    allowed: boolean
    value: T | undefined;
}

export async function CheckSessionCode (props: {sessionCode: string}) : Promise<boolean>
{
  if (props.sessionCode === "Globale-Herde-47") return true;
  return false;
}

export default async function CredentialsChecker (props: {sessionCode: string, username: string, passwordSha256: string}) : Promise<Response<number>> {
    const res = await fetch('https://jsonplaceholder.typicode.com/users', 
        {cache: 'no-store', /* If data changes constantly */ next:{revalidate: 10}})
    const users: User[] = await res.json();

    const index = users.findIndex(n => n.username === props.username);
    if (index != -1) {

        // Let's pretend every User has their Suite Name Hashed instead of their Passwords.
        const encoder = new TextEncoder();
        const data = encoder.encode(users.at(index)?.address.suite);
        const suiteSha256 = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(suiteSha256));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        console.log(`Entered Hash was ${props.passwordSha256} expected ${hashHex}`);
        if (props.passwordSha256 == hashHex) {
            return new Response(true, users.at(index)?.id);
        }
    } else {
        console.log("Username invalid")
    }
    
    return new Response<number>(false, undefined);
  
}
