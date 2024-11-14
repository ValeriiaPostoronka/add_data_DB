const config = require('config');
const utils = config.get('Path.utils');
const db =  require(`${utils}database.js`);
const plots = require(`${utils}plots.js`);
const tools = require(`${utils}mathTools.js`);


const calculateCorelation = async (bTable, bColumn, cTable, cColumn, sDate, eDate) => {
  await db.startConnection();

  const baseTable = bTable;
  const baseColumn = bColumn;
  const corelationTable = cTable;
  const corelationColumn = cColumn;
  const startDate = sDate;
  const endDate = eDate;

  const dbBaseData = await db.getUsableData(baseTable, baseColumn, startDate, endDate);
  const dbCorellationData = await db.getUsableData(corelationTable, corelationColumn, startDate, endDate);
  const baseData = db.getTimeData(dbBaseData, baseColumn);
  const corellationData = db.getTimeData(dbCorellationData, corelationColumn);
  const baseDataSpeed = tools.getDeltas(baseData);
  const corellationDataSpeed = tools.getDeltas(corellationData);

  const pearsonCoef = tools.pearsonCorelation(baseData.map(obj => obj.y), corellationData.map(obj => obj.y));
  const speedPearsonCoef = tools.pearsonCorelation(baseDataSpeed.map(obj => obj.y), corellationDataSpeed.map(obj => obj.y));

  const normalPlot = new plots.corelationPlot(baseData, corellationData);
  await normalPlot.init();
  normalPlot.writeTimePlotFile("corellation");

  const speedPlot = new plots.corelationPlot(baseDataSpeed, corellationDataSpeed);
  await speedPlot.init();
  speedPlot.writeTimePlotFile("speed");

  //await db.endConnection();

  return { pearsonCoef,
    speedPearsonCoef,
    baseData,
    corellationData,
    baseDataSpeed,
    corellationDataSpeed,
    plot:normalPlot.svgTag, 
    speedPlot:speedPlot.svgTag };
};

module.exports = {
  calculateCorelation,
};
