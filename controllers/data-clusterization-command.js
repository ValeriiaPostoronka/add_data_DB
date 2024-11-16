const config = require('config');
const utils = config.get('Path.utils');
const db =  require(`${utils}database.js`);
//const plots = require(`${utils}plots.js`);
const tools = require(`${utils}mathTools.js`);


(async () => {
  db.startConnection();
  const table = process.argv[2];
  const startDate = process.argv[3]; 
  const endDate = process.argv[4];

  const dbData = await db.getClusteringData(table, startDate, endDate);
  console.log(dbData);
  const normalizedDBData = db.normalizeClusteringData(dbData, table);
  console.log(normalizedDBData);
  const valueChanges = tools.getClusteringChanges(normalizedDBData, table);
  console.log(valueChanges);
  //const hourlyClusteringInput = await db.formClusteringArray(dbData, table);
  //console.log(JSON.stringify(hourlyClusteringInput));

  //db.endConnection();
})();
