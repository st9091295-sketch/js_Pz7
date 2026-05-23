// Глобальний масив для поточних курсів валют
let exchangeRates = [];

// Ініціалізація додатку при завантаженні сторінки
document.addEventListener("DOMContentLoaded", () => {
    const dateElement = document.getElementById("current-date");
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('uk-UA');

    // Запускаємо асинхронне отримання поточних курсів
    fetchCurrentRates();
});

// Асинхронна функція завантаження актуальних курсів на сьогодні (async/await)
async function fetchCurrentRates() {
    try {
        const response = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
        if (!response.ok) throw new Error('Мережева помилка при отриманні курсів');
        
        exchangeRates = await response.json();
        
        renderCurrencyList(exchangeRates);
        fillDataLists(exchangeRates);
    } catch (err) {
        console.error('Помилка завантаження даних:', err);
        document.getElementById("currency-list").innerHTML = "<li style='color:red;'>Помилка завантаження даних з банку</li>";
    }
}

// Відображення списку валют на сторінці
function renderCurrencyList(data) {
    const listElement = document.getElementById("currency-list");
    listElement.innerHTML = ""; 

    data.forEach(currency => {
        const li = document.createElement("li");
        li.className = "currency-item";
        
        li.innerHTML = `
            <span>${currency.cc} - ${currency.txt}</span>
            <span>${currency.rate.toFixed(2)} грн</span>
        `;
        
        // Слухач події кліку на рядок валюти для відображення історії
        li.addEventListener('click', () => {
            // Видаляємо клас активності з усіх інших елементів
            document.querySelectorAll('.currency-item').forEach(el => el.classList.remove('active-currency'));
            // Додаємо клас активності поточному елементу
            li.classList.add('active-currency'); 
            
            // Завантажуємо тижневу історію для вибраної валюти
            loadCurrencyHistory(currency.cc);
        });

        listElement.appendChild(li);
    });
}

// ---------------------------------------------------------
// РОБОТА З ІСТОРІЄЮ ВАЛЮТ (За вимогами Лабораторної 6)
// ---------------------------------------------------------

// 1. Функція, що приймає кількість днів і повертає масив дат у форматі YYYYMMDD
function getDatesArray(daysCount) {
    const dates = [];
    for (let i = 0; i < daysCount; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i); // Віднімаємо i днів від поточної дати
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        dates.push(`${year}${month}${day}`);
    }
    return dates;
}

// 2. Асинхронна функція для запиту курсу конкретної валюти на певну дату
async function fetchRatesByDate(valcode, date) {
    const url = `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=${valcode}&date=${date}&json`;
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        return data[0]; // Повертаємо об'єкт валюти (він є першим у масиві від API)
    } catch (error) {
        console.error(`Помилка отримання даних за дату ${date}:`, error);
        return null;
    }
}

// 3. Головна асинхронна функція для завантаження історії курсу
async function loadCurrencyHistory(currencyCode) {
    const historyTitle = document.getElementById('history-title');
    const historyOutput = document.getElementById('history-output');
    
    historyTitle.textContent = `Курс валюти ${currencyCode} за останні 7 днів`;
    historyOutput.innerHTML = '<p style="color:#0056b3;">Завантаження історії з серверу НБУ...</p>';

    // Отримуємо масив з 7 дат (сьогодні та 6 попередніх днів)
    const dates = getDatesArray(7);
    
    // Створюємо масив промісів за допомогою .map()
    const promises = dates.map(date => fetchRatesByDate(currencyCode, date));
    
    try {
        // Одночасно виконуємо всі запити через Promise.all
        const results = await Promise.all(promises);
        
        // Фільтруємо результати від можливих помилок (null або undefined)
        const validResults = results.filter(item => item !== undefined && item !== null);
        
        // Сортуємо отриманий масив від найновішої дати до найстарішої
        validResults.sort((a, b) => {
            // Формат дати від НБУ: "DD.MM.YYYY" -> розбиваємо на частини для порівняння
            const [dayA, monthA, yearA] = a.exchangedate.split('.');
            const [dayB, monthB, yearB] = b.exchangedate.split('.');
            return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
        });

        // Виводимо результат сортування в консоль браузера (вимога завдання)
        console.log(`Відсортована історія для ${currencyCode}:`, validResults);
        
        // Малюємо HTML таблицю на сторінці
        renderHistoryTable(validResults, currencyCode);

    } catch (error) {
        historyOutput.innerHTML = '<p style="color:red;">Не вдалося завантажити історію курсів через помилку.</p>';
        console.error(error);
    }
}

// 4. Функція побудови таблиці в DOM
function renderHistoryTable(data, currencyCode) {
    const historyOutput = document.getElementById('history-output');
    
    if (data.length === 0) {
        historyOutput.innerHTML = '<p>Дані про історію курсу відсутні.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Дата</th>
                    <th>Курс ${currencyCode} (грн)</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(item => {
        tableHTML += `
            <tr>
                <td>${item.exchangedate}</td>
                <td>${item.rate.toFixed(4)} грн</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    historyOutput.innerHTML = tableHTML;
}

// ---------------------------------------------------------
// ЛОГІКА КОНВЕРТЕРА ВАЛЮТ
// ---------------------------------------------------------
function fillDataLists(data) {
    const datalistForeign = document.getElementById("currency-select-foreign");
    const datalistUah = document.getElementById("currency-select-uah");
    let optionsHTML = "";
    data.forEach(currency => {
        optionsHTML += `<option value="${currency.cc}">${currency.cc} - ${currency.txt}</option>`;
    });
    datalistForeign.innerHTML = optionsHTML;
    datalistUah.innerHTML = optionsHTML;
}

const amountForeignInput = document.getElementById("amount-foreign");
const currencyInputForeign = document.getElementById("currency-input-foreign");
const amountUahResult = document.getElementById("amount-uah-result");

function convertToUah() {
    const amount = parseFloat(amountForeignInput.value);
    const currencyCode = currencyInputForeign.value;
    if (isNaN(amount) || !currencyCode) {
        amountUahResult.value = "";
        return;
    }
    const currencyObj = exchangeRates.find(c => c.cc === currencyCode);
    if (currencyObj) {
        amountUahResult.value = (amount * currencyObj.rate).toFixed(2);
    }
}

amountForeignInput.addEventListener("input", convertToUah);
currencyInputForeign.addEventListener("change", convertToUah);

const amountUahInput = document.getElementById("amount-uah");
const currencyInputUah = document.getElementById("currency-input-uah");
const amountForeignResult = document.getElementById("amount-foreign-result");

function convertToForeign() {
    const amountUah = parseFloat(amountUahInput.value);
    const currencyCode = currencyInputUah.value;
    if (isNaN(amountUah) || !currencyCode) {
        amountForeignResult.value = "";
        return;
    }
    const currencyObj = exchangeRates.find(c => c.cc === currencyCode);
    if (currencyObj) {
        amountForeignResult.value = (amountUah / currencyObj.rate).toFixed(2);
    }
}

amountUahInput.addEventListener("input", convertToForeign);
currencyInputUah.addEventListener("change", convertToForeign);