require("dotenv").config();
const pg = require("pg");
const client = new pg.Client(process.env.CONNECTIONSTR);

const tableName = "covid19";
const testData = {
    id: 1,
    dateLastUpdated: "03/30/2020",
    discoveryDate: "03/30/2020",
    gender: "Male",
    ageGroup: "0 to 19 years",
    transmission: "Travel exposure",
    hospitalization: "Not stated",
    ICU: "Unknown",
    status: "Deceased"
}

const create = "CREATE TABLE IF NOT EXISTS " + tableName + "(id INTEGER NOT NULL PRIMARY KEY, dateLastUpdated VARCHAR(10), discoveryDate VARCHAR(10), gender VARCHAR(15), ageGroup VARCHAR(16), transmission VARCHAR(150), hospitalization VARCHAR(15), ICU VARCHAR(15), status VARCHAR(15))";
const drop = "DROP TABLE " + tableName;

async function connect() {
    try {
        await client.connect();
        await client.query(drop);
        await client.query(create);
        insert();
    } catch (err) {
        console.log(err);
    }
}

function getInsertQuery(entry) {
    const keys = Object.keys(entry);
    let start = "INSERT INTO covid19(" + keys[0];
    let end = ") values($" + 1;
    for (let i = 1; i < keys.length; i++) {
        start += ", " + keys[i];
        end += ", $" + (i + 1);
    }
    return start + end + ")";
}

async function insert() {
    try {
        const addRow = getInsertQuery(testData);
        await client.query(addRow, Object.values(testData));
    } catch (err) {
        console.log(err);
    }
}

connect();
