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

class Response {
    constructor(allowed: boolean, value: number | undefined) {
        this.allowed = allowed;
        this.value = value;
    }
    allowed: boolean
    value: number | undefined;
}

async function CredentialsChecker (props: {username: string, passwordSha256: string}) : Promise<Response>{
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
        
        if (props.passwordSha256 == users.at(index)?.address.suite) {
            return new Response(true, users.at(index)?.id);
        }
    }
    return new Response(false, undefined);
  
}

export default CredentialsChecker
