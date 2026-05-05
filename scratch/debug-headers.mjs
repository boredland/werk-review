import { readFileSync } from 'node:fs';

const SHEET_ID = '1KvfowaFkT2JDzdg5dE-fU9YsBubRayK3MYdnFNkewrk';
const sheetName = 'Werke';
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

async function test() {
    const res = await fetch(url);
    const text = await res.text();
    const firstLine = text.split('\n')[0];
    console.log('Headers:', firstLine);
}

test();
