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

//read fields in from external file
let pFields = prompt('Enter file name for dimension list: ');
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

function genVal(obj) {
	let val = 0;
	let options = JSON.parse(obj["Options"]);
	let ratio = obj["Ratio"];
	let decimal = obj["DecimalPlaces"];
	val = rn(options);
	if (ratio !== 1) {
		if (val < ratio) {
			val = 0
		} else {
			val = 1
		};
	}
	if (decimal !== 0) {
		val = parseFloat(val.toFixed(decimal));
	}
	return val;
};

// https://stackoverflow.com/questions/1117916/merge-keys-array-and-values-array-into-an-object-in-javascript
function mergeKeys(keys, vals) {
	let obj = keys.reduce((obj, key, index) => ({ ...obj,
		[key]: vals[index]
	}), {});
	return obj;
};

function setAttributes(account, attribute) {
	let opts = JSON.parse(account["Options"]);
	if (opts["min"] === "property") {
		opts["min"] = evaluate(JSON.parse(account["Properties"])["Options"]["min"], attribute);
	}
	if (opts["max"] === "property") {
		opts["max"] = evaluate(JSON.parse(account["Properties"])["Options"]["max"], attribute);
	}
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
let attributes = [];
// Attributes are optional but if present must be the 2nd to last sheet
if (workSheetsFromFile[workSheetsFromFile.length - 1].name === "ATT_") {
	const workSheetsWithAtt = workSheetsFromFile.pop().data;
	let attKey = workSheetsWithAtt.shift();
	workSheetsWithAtt.forEach(attribute => {
		let aObj = mergeKeys(attKey, attribute);
		attributes.push(aObj);
	})
}
let calcKey = workSheetsWithCalc.shift();
let calcDims = workSheetsWithCalc.filter(element => element.includes("dimension"));
let calcMeasures = workSheetsWithCalc.filter(element => element.includes("measure"));
let measures = [];

calcMeasures.forEach(measure => {
	let mObj = mergeKeys(calcKey, measure);
	measures.push(mObj);
})

// Create a dynamic structure from the spreadsheet definition
let ar = [];
workSheetsFromFile.forEach(dim => {
	let row = dim.data;
	row.shift();
	ar.push(row);
})

let cart = cartesian(...ar);
cart.forEach((row, i) => {
	let unit = row.pop();
	if (calcDims.length > 0) {
		calcDims.forEach(calc => {
			let dObj = mergeKeys(calcKey, calc);
			let calcVal = genVal(dObj);
			row.push(calcVal);
		})
	}
	let accountVal = measures.find(({
		Name
	}) => Name === unit);
	//attribute function
	if (accountVal["Properties"] !== 0) {
		let dim_row = mergeKeys(fields, row);
		let prop_dim = JSON.parse(accountVal["Properties"])["dimension"];
		let dim_att = dim_row[prop_dim];
		let prop = attributes.find(function(value, index) {
			if (value[prop_dim] === dim_att) {
				return value
			};
		});
		accountVal["Options"] = setAttributes(accountVal, prop);
	}
	row.push(genVal(accountVal));
	let merged = mergeKeys(fields, row);
	asyncParser.input.push(JSON.stringify(merged));
})
asyncParser.input.push(null);
console.log('Script complete and output written to ./output/' + pFields + '.csv');