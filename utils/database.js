// Для використання цього модулю потрібно починати підключення та закінчувати його
const { Pool } = require('pg');
const config = require('config');
const tools = require(`${config.get('Path.utils')}mathTools.js`);

// Налаштування підключення до бази даних
const pool = new Pool({
  user: config.get('Database.user'),
  host: config.get('Database.host'),
  database: config.get('Database.database'),
  password: config.get('Database.password'),
  port: config.get('Database.port'),
});

const startConnection = () => {
  pool.connect();
};

const endConnection = () => {
  pool.end();
}

const getColumn = async (query, params) => {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('Error?', err);
  }
}

const getUsableData = async (table, chosenColumn, startDate, endDate) => {
  let queryFilter = '';
  const defaultMinMaxQuery = `SELECT MAX("${chosenColumn}"), MIN("${chosenColumn}") FROM ${table}`;
  const defaultSelectColumnQuery = `SELECT "${chosenColumn}", "Day", "Time" FROM ${table}`;
  
  if (startDate !== undefined && startDate !== '') {
    queryFilter = ` WHERE "Day" = '${startDate}'`;

    if (endDate !== undefined && endDate !== '') {
      queryFilter = ` WHERE "Day" > '${startDate}' AND "Day" <= '${endDate}'`;
    }
  } 
  
  const minmaxObject = (await getColumn(defaultMinMaxQuery + queryFilter))[0];
  const collectedRows = await getColumn(defaultSelectColumnQuery + queryFilter);
  
  const result = {
    ...minmaxObject,
    rows : collectedRows
  }

  return result;
}

const getClusteringData = async (table, startDate, endDate) => {
  let queryFilter = '';
  const pvgisSelectQuery = `SELECT "Irradiance", "Temperature" FROM pvgis_api`;
  const stationDataSelectQuery = `SELECT "Irradiance", "Temperature", "Humidity", "Pressure" FROM station_data`;

  if (startDate !== undefined) {
    queryFilter = ` WHERE "Day" = '${startDate}'`;

    if (endDate !== undefined) {
      queryFilter = ` WHERE "Day" > '${startDate}' AND "Day" <= '${endDate}'`;
    }
  } 

  let collectedRows;
  if (table === "station_data") {
    collectedRows = await getColumn(stationDataSelectQuery + queryFilter);
  }
  else {
    collectedRows = await getColumn(pvgisSelectQuery + queryFilter);
  }

  return collectedRows;
}

const checkNormalization = (data, chosenColumn) => {
  const result = [];

  data.rows.forEach(item => {
    const normalizedVariable = tools.elementNormalization(data.min, data.max, item[chosenColumn]);

    result.push({
      x : item[chosenColumn],
      y : normalizedVariable
    });
  });

  return result;
}

const getTimeData = (data, chosenColumn) => {
  const result = [];

  data.rows.forEach(item => {
    const normalizedVariable = tools.elementNormalization(data.min, data.max, item[chosenColumn]);
    const dateVariable = new Date(`${item.Day.toISOString().split('T')[0]}T${item.Time}.000Z`);

    result.push({
      x : dateVariable,
      y : normalizedVariable
    });
  });

  return result;
}

module.exports = {
  startConnection,
  endConnection,
  getColumn,
  getUsableData,
  getTimeData,
  checkNormalization
}
