
const fs = require('fs'); // Бібліотека роботи з файловою системою
const csv = require('csv-parser'); // Бібліотека роботи з csv форматом даних
const config = require('config');
const db = require(`${config.get('Path.utils')}database.js`)

const loadCSVToDatabase = async (filePath) => {
  try {
    await db.startConnection();  // Підключення до бази даних

    const results = [];
    const luxInWm2 = 217;
    const m2Inmm2 = 0.0001;

    fs.createReadStream(filePath)
      .pipe(csv({
        separator: ';', // Використовуємо `;` як роздільник
        headers: ['Day', 'Time', 'Lumens', 'Humidity', 'Temperature', 'Pressure', 'Voltage', 'Currency', 'Power'],
        skipLines: 0,
      }))
      .on('data', (data) => {
        const timeParts = data.Time.split(':'); // Розділяємо час на години, хвилини та секунди
        const minutes = parseInt(timeParts[1], 10); // Отримуємо хвилини як число

        // Перевіряємо, чи хвилини рівні 10
        if (minutes === 10) {
          // Парсимо дату та час у правильний формат для PostgreSQL
          const parsedData = {
            Day: data.Day.split('.').reverse().join('-'), // Конвертуємо формат DD.MM.YYYY в YYYY-MM-DD
            Time: data.Time,
            Lumens: parseFloat(data.Lumens),
            Humidity: parseFloat(data.Humidity),
            Temperature: parseFloat(data.Temperature),
            Pressure: parseFloat(data.Pressure),
            Voltage: parseFloat(data.Voltage),
            Currency: parseFloat(data.Currency),
            Power: parseFloat(data.Power),
          };
          results.push(parsedData); // Додаємо рядок лише якщо хвилини рівні 10
        }
      })
      .on('end', async () => {
        // Завантаження даних в базу даних
        const insertQuery = `
          INSERT INTO "station_data" ("Day", "Time", "Irradiance", "Humidity", "Temperature", "Pressure", "Voltage", "Currency", "Power")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        try {
          for (const row of results) {
            await db.getColumn(insertQuery, [row.Day, row.Time, (row.Lumens / m2Inmm2) / luxInWm2, row.Humidity, row.Temperature, row.Pressure, row.Voltage, row.Currency, row.Power]);
          }
          console.log('Дані успішно завантажені в базу даних.');
        } 
        catch (err) {
          console.error('Помилка під час вставки даних: ', err);
        } 
        finally {
          await db.endConnection();
        }
      });
    } 
    catch (err) {
      console.error('Помилка під час підключення до бази даних: ', err);
      await db.endConnection();
    }  
}

const filePath = process.argv[2];

if (!filePath) {
  console.error('Будь ласка, вкажіть шлях до CSV файлу як аргумент.');
  process.exit(1);
}

loadCSVToDatabase(filePath);
