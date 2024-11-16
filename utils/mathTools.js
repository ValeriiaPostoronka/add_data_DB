const elementNormalization = (min, max, value, rangeA = 0, rangeB = 1) => {
  value = parseFloat(value);
  return (((value - min) * (rangeB - rangeA)) / (max - min)) - rangeA;
}

const pearsonCorelation = (x, y) => {
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  const minLength = x.length = y.length = Math.min(x.length, y.length);

  x.forEach((xi, idx) => {
    const yi = y[idx];
    sumX += xi;
    sumY += yi;
    sumXY += xi * yi;
    sumX2 += xi * xi;
    sumY2 += yi * yi;
  });

  return (minLength * sumXY - sumX * sumY) / Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY));
}

const getDeltas = (array) => { // У вхідні дані подавати об'єкт форматований на графік
  const objectsArray = Array.from(array);

  const deltas = objectsArray.map((object, index) => {
    if (index === 0) return { x : object.x, y : 0 };
    const result = { y : object.y - objectsArray[index - 1].y, x : object.x };
    return result;
  });

  deltas.shift();

  return deltas;
}

const getCorner = (x1, x2, y1, y2) => {
  const deltaY = y2 - y1;
  const deltaX = x2 - x1;
  const angleInRadians = Math.atan2(deltaY, deltaX);

  const angleInDegrees = angleInRadians * (180 / Math.PI);

  return angleInDegrees;
}
  //  const d3 = await import('d3');
//  const extentForDate = d3.extent(data, d => new Date(`${d["Day"].toISOString().split('T')[0]}T${d["Time"]}.000Z`));
//  const extentForValue = d3.extent(data, d => d[fieldNameY]);
//  const xScale = d3.scaleUtc().domain(extentForDate).range([0, plotWidthWithoutMargin]).nice();
//  const yScale = d3.scaleLinear().domain(extentForValue).range([plotHeightWithoutMargin, 0]).nice();
//  //console.log(extentForValue);
//
//  const point1 = { x: xScale(x1), y: yScale(y1) };
//  const point2 = { x: xScale(x2), y: yScale(y2) };
//
//  const deltaX = point2.x - point1.x;
//  const deltaY = point2.y - point1.y;
//  console.log(x1);
//  console.log(point1.x);
//
//  const angleInRadiance = Math.atan2(deltaY, deltaX);
//  const angleInDegrees = angleInRadiance * (180 / Math.PI);
//  //console.log(angleInDegrees);
//
//  return angleInDegrees;

const formClusteringChange = (data, item, index, fieldArray) => {
  const result = fieldArray.reduce((obj, field) => {
    obj[field] = item[field] - data.rows[index - 1][field];
    return obj;
  }, {});

  return result;
}

const getClusteringChanges = (data, table) => {
  const result = [];

  if (table === 'station_data') {
    data.rows.forEach((item, index) => {
      if (index === 0) return;
      result.push(
        formClusteringChange(data, item, index, ["Irradiance", "Humidity", "Pressure", "Temperature"])
      );
    });
  } else {
    data.rows.forEach((item, index) => {
      if (index === 0) return;
      result.push(
        formClusteringChange(data, item, index, ["Irradiance",  "Temperature"])
      );
    });
  }

  return result;
}

module.exports = {
  elementNormalization,
  getDeltas,
  pearsonCorelation,
  getCorner,
  getClusteringChanges,
}
