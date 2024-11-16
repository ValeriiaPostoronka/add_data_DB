/*
 * Проблема цього скрипта в тому, що він не такий ідеальний, і просто виконує нормування даних за певний період часу
 * Його результат за замовчуванням ніде не зберігається, і просто виводиться
 * Також можна зробити так, щоб отримувались та оброблялись дані, будучи прикріпленими до дати та часу.
 */

const config = require('config');
const utils = config.get('Path.utils');
const plots = require(`${utils}plots.js`);
const db = require(`${utils}database.js`);


(async () => {
  db.startConnection();

  const table = process.argv[2];
  const chosenColumn = process.argv[3];
  const startDate = process.argv[4];
  const endDate = process.argv[5];

  const dbData = await db.getUsableData(table, chosenColumn, startDate, endDate);
  const plotData = db.getTimeData(dbData, chosenColumn);
  const normalizeCheckData = db.checkNormalization(dbData, chosenColumn);
  
  const plot = new plots.timePlot2D(plotData);
  await plot.init();
  plot.writeTimePlotFile();

  const normPlot = new plots.linearPlot(normalizeCheckData);
  await normPlot.init(500, 500);
  normPlot.writePlotFile();
  console.log('end');

  db.endConnection();
})();
