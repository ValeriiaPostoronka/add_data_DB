const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const corelationController = require('../controllers/data-corellation')

router.get('/', asyncHandler(async (req, res, next) => {
  const baseTable = req.query.baseTable;
  const baseColumn = req.query.baseColumn;
  const corelationTable = req.query.corelationTable;
  const corelationColumn = req.query.corelationColumn;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  const result = await corelationController.calculateCorelation(
    baseTable,
    baseColumn,
    corelationTable,
    corelationColumn,
    startDate,
    endDate
  );

  res.json(result);
}));

module.exports = router;
