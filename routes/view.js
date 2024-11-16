const express = require('express');
const router = express.Router();
const db = require('../utils/database');

router.get('/', async (req, res, next) => {
  const columns = req.query.columns.split('-').map(str => `"${str}"`);
  const table = req.query.table;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  const result = await db.getData(table, columns, startDate, endDate);
  
  res.json(result);
})

module.exports = router;
