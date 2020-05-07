import csv from 'csv-parser';
import fs from 'fs';

const getMapping = (entry: any, value: string, jsonData: any): any => {
    return jsonData[value][entry[value]];
}

const formLastUpdated = (entry: any) => {
    const month = entry["Date case was last updated - month"];
    const day = entry["Date case was last updated - day"];
    const year = entry["Reference period"];
    if (month == '99' || day == '99') {
        return "Not stated";
    }
    return month + "/" + day + "/" + year;
}

const formDiscoveryDate = (entry: any) => {
    const month = entry["Episode date - month"];
    const day = entry["Episode date - day"];
    const year = entry["Reference period"];
    if (month == '99' || day == '99') {
        return "Not stated";
    }
    return month + "/" + day + "/" + year;
}

const query = (cases: any[], jsonData: any, resolve: any) => {
    const grouped: any[] = [];
    const mapping: Map<Number, Number> = new Map();
    cases.forEach((tableEntry) => {
        const id: Number = tableEntry["Case identifier number"];
        let val: any = {};
        if (mapping.has(id)) {
            const idx: any = mapping.get(id);
            val = grouped[idx];
        } else {
            grouped.push(val);
            mapping.set(id, grouped.length - 1);
        }
        val["Case identifier number"] = tableEntry["Case identifier number"];
        val[tableEntry['Case information']] = tableEntry['VALUE'];
        val["Reference period"] = tableEntry[Object.keys(tableEntry)[0]];
    });
    const parsed = grouped.map((entry: any) => {
        return {
            id: entry["Case identifier number"],
            dateLastUpdated: formLastUpdated(entry),
            discoveryDate: formDiscoveryDate(entry),
            gender: getMapping(entry, "Gender", jsonData),
            ageGroup: getMapping(entry, "Age group", jsonData),
            transmission: getMapping(entry, "Transmission", jsonData),
            hospitalization: getMapping(entry, "Hospitalization", jsonData),
            ICU: getMapping(entry, "Intensive care unit", jsonData),
            status: getMapping(entry, "Status", jsonData)
        };
    });
    resolve(parsed);
}

export default function parseCsv(): any {
    const cases: any[] = [];
    const data = fs.readFileSync("../obj/mapping.json", "utf8");
    const jsonData: any = JSON.parse(data);
    return new Promise((resolve, reject) => {
        fs.createReadStream('../data/DATA.csv')
        .pipe(csv())
        .on('data', (data: any) => cases.push(data))
        .on('end', () => query(cases, jsonData, resolve));
    })
}