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

const getCorner = (object1, object2) => {
  const x1 = object1.x.getTime();
  const x2 = object2.x.getTime();
  const y1 = object1.y;
  const y2 = object2.y;

  const deltaX = x2 - x1;
  const deltaY = y2 - y1;

  const angleInRadiance = Math.atan2(deltaY, deltaX);
  const angleInDegrees = angleInRadiance * (180 / Math.PI);

  return angleInDegrees;
}

module.exports = {
  elementNormalization,
  getDeltas,
  pearsonCorelation,
  getCorner
}
