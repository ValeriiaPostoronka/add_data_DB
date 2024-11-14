const express = require('express');
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// Require routes
const indexRouter = require("./routes/index");
const resultRouter = require("./routes/result");
const corelationapiRouter = require("./routes/corelation_api");

const app = express();
app.set('view engine', 'ejs');

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/assets', express.static("public"));

// Specify routes
app.use("/", indexRouter);
app.use("/result", resultRouter);
app.use("/api_corelation", corelationapiRouter);

// Error handling
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("pages/error", { message:err.message });
});

module.exports = app;
