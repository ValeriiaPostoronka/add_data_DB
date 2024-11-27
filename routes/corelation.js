const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('pages/corelation');
});

module.exports = router;
