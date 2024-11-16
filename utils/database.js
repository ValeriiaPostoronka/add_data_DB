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
  const pvgisSelectQuery = `SELECT "Irradiance", "Temperature", "Day", "Time" FROM pvgis_api`;
  const stationSelectQuery = `SELECT "Irradiance", "Temperature", "Humidity", "Pressure", "Day", "Time" FROM station_data`;
  const pvgisMinMaxQuery = 
    `SELECT 
      MAX("Irradiance") AS max_irradiance,
      MAX("Temperature") AS max_temperature,
      MIN("Irradiance") AS min_irradiance,
      MIN("Temperature") AS min_temperature
    FROM pvgis_api`;
  const stationMinMaxQuery = 
    `SELECT 
      MAX("Irradiance") AS max_irradiance,
      MAX("Temperature") AS max_temperature,
      MIN("Irradiance") AS min_irradiance,
      MIN("Temperature") AS min_temperature,
      MAX("Humidity") AS max_irradiance,
      MAX("Pressure") AS max_temperature,
      MIN("Humidity") AS min_irradiance,
      MIN("Pressure") AS min_temperature
    FROM pvgis_api`;

  if (startDate !== undefined) {
    queryFilter = ` WHERE "Day" = '${startDate}'`;

    if (endDate !== undefined) {
      queryFilter = ` WHERE "Day" > '${startDate}' AND "Day" <= '${endDate}'`;
    }
  } 

  let collectedRows;
  let minmaxObject;
  if (table === "station_data") {
    collectedRows = await getColumn(stationSelectQuery + queryFilter);
    minmaxObject = (await getColumn(stationMinMaxQuery + queryFilter))[0];
  }
  else {
    collectedRows = await getColumn(pvgisSelectQuery + queryFilter);
    minmaxObject = (await getColumn(pvgisMinMaxQuery + queryFilter))[0];
  }

  const result = {
    ...minmaxObject,
    rows : collectedRows
  }

  return result;
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

const getData = async (table, chosenColumns, startDate, endDate) => {
  const selectQuery = `SELECT ${chosenColumns.toString()} FROM ${table}`;
  let queryFilter;

  if (startDate !== undefined && startDate !== '') {
    queryFilter = ` WHERE "Day" = '${startDate}'`;

    if (endDate !== undefined && endDate !== '') {
      queryFilter = ` WHERE "Day" > '${startDate}' AND "Day" <= '${endDate}'`;
    }
  } 

  const collectedRows = await getColumn(selectQuery + queryFilter);
  return collectedRows;
}

const formClusteringElement = async (currentValue, previousValue, fieldName, changes) => {
  const previous = normalizedValues[index - 1];
  const current = normalizedValues[index];
  const x = current[fieldName];
  const x_prime = await tools.getCorner(
    
  )
  const x_speed_prime = await tools.getCorner(
    j, // x1
    j, // y1
    j, // x2
    j, // y2
    j, // minmaxX
    d3.extent(), // minmaxY
    1100, // pWidth
    390 // pHeight
  );

  return [x, x_prime, x_speed_prime];
}

const normalizeClusteringData = (data, table) => {
  const result = [];

  data.rows.forEach(item => {
    const irradiance = tools.elementNormalization(data.min_irradiance, data.max_irradiance, item.Irradiance);;
    const temperature = tools.elementNormalization(data.min_temperature, data.max_temperature, item.Temperature);;

    if (table === 'station_data') {
      const humidity = tools.elementNormalization(data.min_temperature, data.max_humidity, item.Humidity);;
      const pressure = tools.elementNormalization(data.min_pressure, data.max_pressure, item.Pressure);;

      result.push({
        Irradiance: irradiance,
        Humidity: humidity,
        Pressure: pressure,
        Temperature: temperature
      });
    }
    else {
      result.push({
        Irradiance: irradiance,
        Temperature: temperature
      });
    }
  });

  data.rows = result;

  return data;
}

const formClusteringArray = async (data, changes, table) => {
  const d3 = import('d3');


}
  
//  const hourly = [];
//  //console.log(changes);
//  const normalizedValues = [];
//
//  if (table === 'station_data') {
//    data.rows.forEach(async (item, index) => {
//
//    const changes = tools.getClusteringChanges(normalizedValues, table);
//
//    normalizedValues.forEach(async (item, index) => {
//      if (index === 0 || index === 1) return;
//
//      hourly.push({
//        Day: data.rows[index].Day,
//        Time: data.rows[index].Time,
//        Result: [
//          await formClusteringElement(data, normalizedValues, "Irradiance", changes),
//          await formClusteringElement(data, normalizedValues, "Humidity", changes),
//          await formClusteringElement(data, normalizedValues, "Pressure", changes),
//          await formClusteringElement(data, normalizedValues, "Temperature", changes)
//        ]
//      });
//    });
//  }
//  else {
//    data.rows.forEach(async (item, index) => {
//      if (index === 0 || index === 1) return;
//      //console.log(await formClusteringElement(data, index, "Temperature", changes));
//      hourly.push({
//        Day: item.Day,
//        Time: item.Time,
//        Result: [
//          await formClusteringElement(data, index, "Temperature", changes),
//          await formClusteringElement(data, index, "Irradiance", changes)
//        ]
//      });
//    });
//  }
//
//  return hourly;

module.exports = {
  startConnection,
  endConnection,
  getColumn,
  getUsableData,
  getTimeData,
  checkNormalization,
  getClusteringData,
  formClusteringArray,
  getData,
  normalizeClusteringData
}
