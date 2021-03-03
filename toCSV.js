const fs = require('fs');
const Datastore = require('nedb');
const db = new Datastore({ filename: './main.db' });

const arrayToCSV = ({data = null, columnDelimiter = ",", lineDelimiter = "\n"}) => {
	let result, ctr, keys

	if (data === null || !data.length) {
		return null
	}

	keys = Object.keys(data[0])

	result = ""
	result += keys.join(columnDelimiter)
	result += lineDelimiter

	data.forEach(item => {
		ctr = 0
		keys.forEach(key => {
			if (ctr > 0) {
				result += columnDelimiter
			}

			result += typeof item[key] === "string" && item[key].includes(columnDelimiter) ? `"${item[key]}"` : item[key]
			ctr++
		})
		result += lineDelimiter
	})

	return result
}

db.loadDatabase(function(e) {
  if (e) return console.log(e);
  db.find({}, function(err, docs) {
    if (err) return console.log(err);
    const arrayStr = arrayToCSV({data: docs});
    fs.writeFileSync('./db.csv', arrayStr);
  });
});
