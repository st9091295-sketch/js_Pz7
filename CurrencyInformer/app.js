fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json')
  .then(response => response.json())
  .then(data => {
      const usd = data.find(currency => currency.cc === 'USD');
      console.log(`Курс долара США: ${usd.rate} грн`);
  })
  .catch(err => console.error(err));
// Глобальна змінна для збереження курсів валют
let exchangeRates = [];


// 6. Ініціалізація додатку
document.addEventListener("DOMContentLoaded", () => {
    // Оновлення поточної дати
    const dateElement = document.getElementById("current-date");
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('uk-UA'); // Виведення у зручному форматі [cite: 233, 234]

    // Завантаження даних з API
    fetchData();
});

// 3. Отримання даних з API за допомогою fetch()
function fetchData() {
    fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json') // [cite: 66]
        .then(response => response.json()) // [cite: 67, 79]
        .then(data => { // [cite: 68]
            exchangeRates = data;
            renderCurrencyList(data);
            fillDataLists(data);
        })
        .catch(err => {
            console.error('Помилка завантаження даних:', err); // [cite: 74, 81]
            document.getElementById("currency-list").innerHTML = "<li>Помилка завантаження даних</li>";
        });
}

// 4. Відображення даних у DOM
function renderCurrencyList(data) {
    const listElement = document.getElementById("currency-list");
    listElement.innerHTML = ""; // Очищення існуючого списку [cite: 86]

    data.forEach(currency => {
        const li = document.createElement("li");
        li.className = "currency-item";
        
        // Відображення коду, назви та курсу валюти [cite: 87, 88, 89]
        li.innerHTML = `
            <span>${currency.cc} - ${currency.txt}</span>
            <span>${currency.rate.toFixed(2)} грн</span>
        `;
        listElement.appendChild(li);
    });
}

// Заповнення даталістів для конвертера [cite: 132]
function fillDataLists(data) {
    const datalistForeign = document.getElementById("currency-select-foreign");
    const datalistUah = document.getElementById("currency-select-uah");
    
    let optionsHTML = "";
    data.forEach(currency => {
        // Опція зберігає значення коду валюти
        optionsHTML += `<option value="${currency.cc}">${currency.cc} - ${currency.txt}</option>`;
    });

    datalistForeign.innerHTML = optionsHTML;
    datalistUah.innerHTML = optionsHTML;
}

// 5. Реалізація конвертера валют
// 5.1 Конвертація з іноземної валюти в гривні [cite: 134]
const amountForeignInput = document.getElementById("amount-foreign");
const currencyInputForeign = document.getElementById("currency-input-foreign");
const amountUahResult = document.getElementById("amount-uah-result");

function convertToUah() {
    const amount = parseFloat(amountForeignInput.value); // [cite: 135]
    const currencyCode = currencyInputForeign.value;
    
    if (isNaN(amount) || !currencyCode) { // [cite: 154]
        amountUahResult.value = "";
        return;
    }

    const currencyObj = exchangeRates.find(c => c.cc === currencyCode);
    if (currencyObj) {
        const rate = currencyObj.rate; // [cite: 136]
        const result = amount * rate; // [cite: 137]
        amountUahResult.value = result.toFixed(2); // Округлення до 2 знаків [cite: 138, 155]
    }
}

amountForeignInput.addEventListener("input", convertToUah); // [cite: 139, 150]
currencyInputForeign.addEventListener("change", convertToUah); // [cite: 139, 150]

// 5.2 Конвертація з гривень в іноземну валюту [cite: 141]
const amountUahInput = document.getElementById("amount-uah");
const currencyInputUah = document.getElementById("currency-input-uah");
const amountForeignResult = document.getElementById("amount-foreign-result");

function convertToForeign() {
    const amountUah = parseFloat(amountUahInput.value); // [cite: 142]
    const currencyCode = currencyInputUah.value;

    if (isNaN(amountUah) || !currencyCode) {
        amountForeignResult.value = "";
        return;
    }

    const currencyObj = exchangeRates.find(c => c.cc === currencyCode);
    if (currencyObj) {
        const rate = currencyObj.rate; // [cite: 143]
        const result = amountUah / rate; // [cite: 144]
        amountForeignResult.value = result.toFixed(2); // [cite: 145, 155]
    }
}

amountUahInput.addEventListener("input", convertToForeign); // [cite: 150]
currencyInputUah.addEventListener("change", convertToForeign); // [cite: 150]