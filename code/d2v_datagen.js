const xlsx = require('node-xlsx').default;
const {
	AsyncParser
} = require('json2csv');
const fs = require('fs');
const rn = require('random-number');
//add CLI prompt library
const prompt = require('prompt-sync')();
// load math.js (using node.js)
const {
	evaluate,
	format
} = require("mathjs");

// read fields in from external file
const pFields = prompt('Enter file name for dimension list: ');
const fields = xlsx.parse('./input/' + pFields + '_fields.xlsx')[0].data[0];
fields.push("Value");

const opts = {
	fields
};
const transformOpts = {
	highWaterMark: 32768
};

const asyncParser = new AsyncParser(opts, transformOpts);

// https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
const cartesian =
	(...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

// https://stackoverflow.com/questions/1117916/merge-keys-array-and-values-array-into-an-object-in-javascript	
const merge =
	(keys, vals) => (Array.isArray(vals[0]))
		? vals.reduce((valAccumulator, curVal) => {
			return [...valAccumulator, keys.reduce((objAccumulator, curKey, keyIndex) => ({
				...objAccumulator,
				[curKey]: curVal[keyIndex]
			}), {})];
		}, [])
		: keys.reduce((obj, key, index) => ({ ...obj, [key]: vals[index] }), {});

// https://medium.com/javascript-scene/nested-ternaries-are-great-361bddd0f340
const genVal =
	(obj) => obj.reduce((genAccumulator, curGenVal) => {
		let val = rn(JSON.parse(curGenVal.Options));
		return [...genAccumulator,
		(curGenVal["Ratio"] === 1 && curGenVal["DecimalPlaces"] === 0)
			? val
			: (curGenVal["DecimalPlaces"] !== 0)
				? parseFloat(val.toFixed(curGenVal["DecimalPlaces"]))
				: (curGenVal["Ratio"] !== 1 && (val < curGenVal["Ratio"]))
					? 0
					: 1
		]
	}, []);

const setAttributes =
	(account, attribute) => {
		let opts = JSON.parse(account["Options"]);
		(opts["min"] === "property") ? opts["min"] = evaluate(JSON.parse(account["Properties"])["Options"]["min"], attribute) : opts["min"];
		(opts["max"] === "property") ? opts["max"] = evaluate(JSON.parse(account["Properties"])["Options"]["max"], attribute) : opts["max"];
		return JSON.stringify(opts);
	};

let csv = '';
asyncParser.processor
	.on('data', chunk => (csv += chunk.toString()))
	.on('end', () => fs.writeFileSync('./output/' + pFields + '.csv', csv))
	.on('error', err => console.error(err));

// Parse a file
const workSheetsFromFile = xlsx.parse('./input/' + pFields + '_dim.xlsx');
// CALC_ sheet must be the last sheet and is mandatory
const workSheetsWithCalc = workSheetsFromFile.pop().data;
let attributes;
// Attributes are optional but if present must be the 2nd to last sheet
if (workSheetsFromFile[workSheetsFromFile.length - 1].name === "ATT_") {
	const workSheetsWithAtt = workSheetsFromFile.pop().data;
	let attKey = workSheetsWithAtt.shift();
	attributes = merge(attKey, workSheetsWithAtt);
};

const calcKey = workSheetsWithCalc.shift();
const calcDims = workSheetsWithCalc.filter(element => element.includes("dimension"));
const calcMeasures = workSheetsWithCalc.filter(element => element.includes("measure"));
const measures = merge(calcKey, calcMeasures);

// Create a dynamic structure from the spreadsheet definition
const ar = workSheetsFromFile.reduce((sheetAccumulator, currentVal) => {
	currentVal.data.shift();
	return [...sheetAccumulator, currentVal.data]
}, []);

const cart = cartesian(...ar);
cart.forEach((row) => {
	let unit = row.pop();
	// adapted to multiple calculated dimensions - different from account measures as each dimension is a separate column
	if (calcDims.length > 0) {
		row.push(genVal(merge(calcKey, calcDims)));
	};
	let accountVal = measures.find(obj => obj.Name === unit);
	// attribute function
	if (accountVal["Properties"] !== 0) {
		let prop_dim = JSON.parse(accountVal["Properties"])["dimension"];
		let prop = attributes.find(Value => Value[prop_dim] === merge(fields, row)[prop_dim]);
		accountVal["Options"] = setAttributes(accountVal, prop);
	};
	row.push(genVal([accountVal]));
	// flatten any container arrays we picked up along the way
	let merged = merge(fields, row.flat());
	asyncParser.input.push(JSON.stringify(merged));
})
asyncParser.input.push(null);
console.log('Script complete and output written to ./output/' + pFields + '.csv');