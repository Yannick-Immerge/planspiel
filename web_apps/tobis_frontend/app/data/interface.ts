import {createPool} from 'mysql2/promise'

export const pool = createPool({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'mydatabase'
});
