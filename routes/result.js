const express = require('express');
const router = express.Router();

const test = async (day, alpha, table, column) => {
  const testController = require('../controllers/checkdata-shapiroTest');
  return await testController.calculateTest(day, alpha, table, column);
}

const normalization = async (table, column, startDate, endDate) => {
  const normalizationController = require('../controllers/data-normalization-vizual');
  return await normalizationController.calculateNormalization(table, column, startDate, endDate);
}

const corelation = async (bTable, bColumn, cTable, cColumn, sDate, eDate) => {
  const corelationController = require('../controllers/data-corellation');
  return await corelationController.calculateCorelation(bTable, bColumn, cTable, cColumn, sDate, eDate);
}

router.get('/', async (req, res, next) => {
  const getParams = req.query;
  let result;

  if (getParams.formId === "test") {
    result = await test(getParams.day, getParams.alpha, getParams.table, getParams.column);
  } else if (getParams.formId === "normalization") {
    result = await normalization(
      getParams.table,
      getParams.column,
      getParams.startDate,
      getParams.endDate
    );
  } else if (getParams.formId === "corelation") {
    result = await corelation(
      getParams.baseTable, 
      getParams.baseColumn,
      getParams.corelationTable,
      getParams.corelationColumn,
      getParams.startDate,
      getParams.endDate
    );
  }

  res.render('pages/result', { getParams, result });
});

module.exports = router;
