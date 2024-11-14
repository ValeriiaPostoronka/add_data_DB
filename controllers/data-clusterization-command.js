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

  db.endConnection();
})();
