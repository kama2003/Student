document.getElementById('save-attendance').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.attendance-checkbox');
    let attendance = [];

    // Получаем дату, время и дисциплину
    const date = document.getElementById('attendance-date').value;
    const time = document.getElementById('attendance-time').value;
    const subject = document.getElementById('subject').value;

    if (!date || !time || !subject) {
        alert('Пожалуйста, заполните все поля: дата, время и название дисциплины');
        return;
    }

    // Сохраняем посещаемость студентов
    checkboxes.forEach((checkbox) => {
        const studentName = checkbox.closest('tr').querySelector('td').textContent;
        const isPresent = checkbox.checked;
        attendance.push({ student: studentName, present: isPresent, date, time, subject });
    });

    // Отправляем данные на сервер
    fetch('/save-attendance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendance),
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
    })
    .catch((error) => {
        console.error('Ошибка:', error);
    });
});
