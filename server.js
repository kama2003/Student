const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const xlsx = require('xlsx');

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Раздача статических файлов

// Функция для поиска студента в Excel и обновления данных
function updateAttendanceInExcel(attendanceData) {
    let filePath = 'attendance.xlsx';

    let workbook;
    let worksheet;

    // Проверяем, существует ли Excel файл
    if (fs.existsSync(filePath)) {
        // Читаем существующий файл
        workbook = xlsx.readFile(filePath);
        worksheet = workbook.Sheets['Посещаемость'];
    } else {
        // Создаем новую книгу и лист
        workbook = xlsx.utils.book_new();
        worksheet = xlsx.utils.aoa_to_sheet([['Имя студента', 'Посещаемость', 'Дата', 'Время', 'Дисциплина']]);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Посещаемость');
    }

    // Преобразуем существующий лист в массив для поиска
    const sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Для каждого студента обновляем данные или добавляем новые
    attendanceData.forEach((record) => {
        let updated = false;
        
        // Ищем студента в листе
        for (let i = 1; i < sheetData.length; i++) {
            if (sheetData[i][0] === record.student && sheetData[i][4] === record.subject) {
                // Обновляем данные студента
                sheetData[i][1] = record.present ? 'Присутствует' : 'Отсутствует';
                sheetData[i][2] = record.date;
                sheetData[i][3] = record.time;
                sheetData[i][4] = record.subject;
                updated = true;
                break;
            }
        }

        // Если студент не найден, добавляем новую строку
        if (!updated) {
            const newRow = [record.student, record.present ? 'Присутствует' : 'Отсутствует', record.date, record.time, record.subject];
            sheetData.push(newRow);
        }
    });

    // Преобразуем массив обратно в лист
    const newWorksheet = xlsx.utils.aoa_to_sheet(sheetData);
    workbook.Sheets['Посещаемость'] = newWorksheet;

    // Сохраняем файл
    xlsx.writeFile(workbook, filePath);
}

app.post('/save-attendance', (req, res) => {
    const attendanceData = req.body;

    // Обновляем или добавляем данные в Excel
    updateAttendanceInExcel(attendanceData);

    res.send('Посещаемость успешно сохранена и обновлена в Excel');
});

app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
