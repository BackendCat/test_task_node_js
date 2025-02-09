import mysql from "mysql2";
import { stopIfNotExists } from "../config";


stopIfNotExists([
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
]);


const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0
});


export default db.promise();
