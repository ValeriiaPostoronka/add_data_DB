const config = require('config');
const utils = config.get('Path.utils');
const plots = require(`${utils}plots.js`);
const db = require(`${utils}database.js`);


const calculateNormalization = async (t, c, s, e) => {
  db.startConnection();
  const table = t;
  const chosenColumn = c;
  const startDate = s;
  const endDate = e;

  const dbData = await db.getUsableData(table, chosenColumn, startDate, endDate);
  const plotData = db.getTimeData(dbData, chosenColumn);
  const normalizeCheckData = db.checkNormalization(dbData, chosenColumn);
  
  const plot = new plots.timePlot2D(plotData);
  await plot.init();
  plot.writeTimePlotFile();

  const normPlot = new plots.linearPlot(normalizeCheckData);
  await normPlot.init(500, 500);
  normPlot.writePlotFile();

  return {plot:plot.svgTag, plotCheck:normPlot.svgTag};
};

module.exports = {
  calculateNormalization
}
