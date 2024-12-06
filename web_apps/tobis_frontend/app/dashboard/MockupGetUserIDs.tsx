import { stat } from 'fs';
import { List } from 'postcss/lib/list';
import React from 'react'

interface UserStatus {
    userID: number,
    name: string,
    burger: number,
    status: number, // 0 - No User Attached   1 - User Attached   2 - User Attached & Online
}

interface User {
    id: number,
    username: string,
    name: string,
    address: {suite: string},
}

export async function MockupGetUserIDs() : Promise<UserStatus[]> {
    const res = await fetch('https://jsonplaceholder.typicode.com/users', 
        {cache: 'no-store', /* If data changes constantly */ next:{revalidate: 10}})
    const users: User[] = await res.json();

    return users.map(n => { let uStatus = 0;
        if (n.id > 6) uStatus = 1;
        else if (n.id > 3) uStatus = 2;
        const burger = (n.id % 2 == 0)? 0 : 1;
        let userStatus : UserStatus = ({burger: burger, name: n.name.split(" ")[0], userID: n.id, status: uStatus}); return userStatus;})
}
