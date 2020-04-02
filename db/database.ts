require("dotenv").config();
const testData = require("./testData.ts").testData;
const pg = require("pg");
const client = new pg.Client(process.env.CONNECTIONSTR);
const tableName = "covid19";

const createTable = "CREATE TABLE IF NOT EXISTS " + tableName + "(id INTEGER NOT NULL PRIMARY KEY, dateLastUpdated VARCHAR(10), discoveryDate VARCHAR(10), gender VARCHAR(15), ageGroup VARCHAR(16), transmission VARCHAR(150), hospitalization VARCHAR(15), ICU VARCHAR(15), status VARCHAR(15))";
const dropTable = "DROP TABLE IF EXISTS " + tableName;

async function connect() {
    try {
        await client.connect();
        await client.query(dropTable);
        await client.query(createTable);
        insert(testData);
    } catch (err) {
        console.log(err);
    }
}

function _getInsertQuery(entry) {
    const keys = Object.keys(entry);
    let start = "INSERT INTO covid19(" + keys[0];
    let end = ") values($" + 1;
    for (let i = 1; i < keys.length; i++) {
        start += ", " + keys[i];
        end += ", $" + (i + 1);
    }
    return start + end + ")";
}

async function insert(data) {
    try {
        data.forEach(async (element) => {
            const addRow = _getInsertQuery(element);
            const result = await client.query(addRow, Object.values(element));
            console.log(result);
        });
    } catch (err) {
        console.log(err);
    }
}

connect();
