const config = require('config');
const utils = config.get('Path.utils');
const db =  require(`${utils}database.js`);
const plots = require(`${utils}plots.js`);
const tools = require(`${utils}mathTools.js`);

db.startConnection();

(async () => {
  const baseTable = process.argv[2];
  const baseColumn = process.argv[3];
  const corelationTable = process.argv[4];
  const corelationColumn = process.argv[5];
  const startDate = process.argv[6]; 
  const endDate = process.argv[7];

  const dbBaseData = await db.getUsableData(baseTable, baseColumn, startDate, endDate);
  const dbCorellationData = await db.getUsableData(corelationTable, corelationColumn, startDate, endDate);
  const baseData = db.getTimeData(dbBaseData, baseColumn);
  const corellationData = db.getTimeData(dbCorellationData, corelationColumn);
  const baseDataSpeed = tools.getDeltas(baseData);
  const corellationDataSpeed = tools.getDeltas(corellationData);

  const pearsonCoef = tools.pearsonCorelation(baseData.map(obj => obj.y), corellationData.map(obj => obj.y));
  const speedPearsonCoef = tools.pearsonCorelation(baseDataSpeed.map(obj => obj.y), corellationDataSpeed.map(obj => obj.y));
  console.log("Коефіцієнт кореляції Пірсона: " + pearsonCoef);
  console.log("Коефіцієнт кореляції Пірсона швидкості змін: " + speedPearsonCoef);

  const normalPlot = new plots.corelationPlot(baseData, corellationData);
  await normalPlot.init();
  normalPlot.writeTimePlotFile("corellation");

  const speedPlot = new plots.corelationPlot(baseDataSpeed, corellationDataSpeed);
  await speedPlot.init();
  speedPlot.writeTimePlotFile("speed");

  db.endConnection();
})();
