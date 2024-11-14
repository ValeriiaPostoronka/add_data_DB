const config = require('config');
const db = require(`${config.get('Path.utils')}database.js`)

// Функція для запису даних у таблицю pvgis_api
const insertData = async (day, time, power, irradiance, sun_height, temperature, wind) => {
  const query = `
    INSERT INTO pvgis_api ("Day", "Time", "Power", "Irradiance", "Sun_height", "Temperature", "Wind")
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  const values = [day, time, power, irradiance, sun_height, temperature, wind];
  await db.getColumn(query, values);
};

// Функція для отримання даних від PVGIS API та запису в базу даних
const fetchPVGISData = async () => {
  const baseUrl = 'https://re.jrc.ec.europa.eu/api/v5_3/';
  const endpoint = 'seriescalc'; // PVGIS-SARAH3 series calculation
  const latitude = 50.45;
  const longitude = 30.525;
  const startDate = '2020'; // Start time of the data (ISO format)
  const endDate = '2021'; // End time of the data (ISO format)
  const peakpower = 0.6; 
  const loss = 14;     

  // Формуємо URL запиту
  const url = `${baseUrl}${endpoint}?lat=${latitude}&lon=${longitude}&outputformat=json&startyear=${startDate}&endyear=${endDate}&pvcalculation=1&peakpower=${peakpower}&loss=${loss}`;

  try {
    // Підключення до бази даних
    await db.startConnection();

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    // Обробляємо погодинні дані
    data.outputs.hourly.forEach(async entry => {
    // Витягуємо дату та час з рядка
    const day = entry.time.split(':')[0];  // Формат: YYYYMMDD
    const time = entry.time.split(':')[1]; // Формат: HHMM

    // Отримуємо рік, місяць і день
    const year = day.substring(0, 4);
    const month = day.substring(4, 6);
    const dayOfMonth = day.substring(6, 8);
    
    // Отримуємо години та хвилини
    const hours = time.substring(0, 2);
    const minutes = time.substring(2, 4);
    // Створюємо об'єкт дати
    const date = new Date(`${year}-${month}-${dayOfMonth}T${hours}:${minutes}:00.000Z`); // month - 1, бо місяці в JavaScript починаються з 0

    // Додаємо 2 години до дати
    date.setHours(date.getHours() + 2);

    // Отримуємо нові значення дати та часу
    const isoFormatDate = date.toISOString().split('T');
    const newDay = isoFormatDate[0]; // Формат YYYYMMDD
    const newTime = isoFormatDate[1].slice(0, 7);   // Формат HHMM
 
    const power = entry.P;
    const irradiance = entry["G(i)"];
    const sun_height = entry.H_sun;
    const temperature = entry.T2m;
    const wind = entry.WS10m;
  
    // Записуємо кожен запис в базу даних
    await insertData(newDay, newTime, power, irradiance, sun_height, temperature, wind);
  });

    
    await new Promise(r => setTimeout(r, 5000));
    console.log('All data has been processed');
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  } finally {
    // Закриваємо підключення до бази даних
    await db.endConnection();
  }
};

fetchPVGISData();
