import dotenv from 'dotenv';
import pg from 'pg';
import parseCsv from './migration.js';

dotenv.config();

const client = new pg.Client(process.env.CONNECTIONSTR);
const tableName = "covid19";
const createTable = "CREATE TABLE IF NOT EXISTS " + tableName + "(id INTEGER NOT NULL PRIMARY KEY, dateLastUpdated VARCHAR(20), discoveryDate VARCHAR(20), gender VARCHAR(20), ageGroup VARCHAR(20), transmission VARCHAR(150), hospitalization VARCHAR(20), ICU VARCHAR(20), status VARCHAR(20))";
const dropTable = "DROP TABLE IF EXISTS " + tableName;

async function connect() {
    try {
        await client.connect();
        await client.query(dropTable);
        await client.query(createTable);
        const parsedData = await parseCsv();
        await insert(parsedData);
    } catch (err) {
        console.log(err);
    }
}

function _getInsertQuery(entry: any) {
    const keys = Object.keys(entry);
    let start = "INSERT INTO " + tableName + "(" + keys[0];
    let end = ") values($" + 1;
    for (let i = 1; i < keys.length; i++) {
        start += ", " + keys[i];
        end += ", $" + (i + 1);
    }
    return start + end + ")";
}

async function insert(data: any) {
    const promises: Array<Promise<any>> = [];
    data.forEach((element: any) => {
        const addRow = _getInsertQuery(element);
        promises.push(client.query(addRow, Object.values(element)));
    });
    await Promise.all(promises);
}

export default async function getData() {
    await connect();
    const getQuery = "SELECT * FROM " + tableName;
    return await client.query(getQuery);
};
