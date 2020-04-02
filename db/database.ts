import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import parseCsv from './migration.js';

dotenv.config();

const client = new pg.Client(process.env.CONNECTIONSTR);
const tableName = "covid19";
const createTable = "CREATE TABLE IF NOT EXISTS " + tableName + "(id INTEGER NOT NULL PRIMARY KEY, dateLastUpdated VARCHAR(10), discoveryDate VARCHAR(10), gender VARCHAR(15), ageGroup VARCHAR(16), transmission VARCHAR(150), hospitalization VARCHAR(15), ICU VARCHAR(15), status VARCHAR(15))";
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

connect();
