// Початкові дані (масив об'єктів порід)
const dogs = [
    { name: "Німецька вівчарка", group: "Пастуші", weight: 35, height: 60, lifespan: 11, desc: "Розумна, віддана та універсальна службова собака." },
    { name: "Такса", group: "Мисливські", weight: 9, height: 25, lifespan: 14, desc: "Довга і низька собака, з розвиненим мисливським інстинктом." },
    { name: "Мопс", group: "Декоративні", weight: 8, height: 28, lifespan: 13, desc: "Маленька собака з характерною зморшкуватою мордочкою." },
    { name: "Бордер-коллі", group: "Пастуші", weight: 19, height: 50, lifespan: 15, desc: "Надзвичайно енергійна та одна з найрозумніших порід." },
    { name: "Бігль", group: "Мисливські", weight: 11, height: 38, lifespan: 12, desc: "Дружелюбний гончак, відомий своїм чудовим нюхом." }
];

// Отримуємо посилання на елементи DOM
const dogListContainer = document.getElementById('dogList');
const searchInput = document.getElementById('searchInput');
const groupFilter = document.getElementById('groupFilter');
const weightFilter = document.getElementById('weightFilter');
const sortSelect = document.getElementById('sortSelect');

// Головна функція для оновлення інтерфейсу
function updateUI() {
    // 1. Отримуємо значення з елементів управління
    const searchTerm = searchInput.value.toLowerCase();
    const selectedGroup = groupFilter.value;
    const maxWeight = parseFloat(weightFilter.value);
    const sortBy = sortSelect.value;

    // 2. Застосовуємо пошук та фільтрацію (Завдання 2 та 3)
    let filteredDogs = dogs.filter(dog => {
        // Пошук по назві або опису
        const matchesSearch = dog.name.toLowerCase().includes(searchTerm) || 
                              dog.desc.toLowerCase().includes(searchTerm);
        
        // Фільтр по групі
        const matchesGroup = selectedGroup === 'all' || dog.group === selectedGroup;
        
        // Фільтр по вазі (якщо поле пусте або NaN, пропускаємо умову)
        const matchesWeight = isNaN(maxWeight) || dog.weight <= maxWeight;

        // Порода має відповідати ВСІМ умовам одночасно
        return matchesSearch && matchesGroup && matchesWeight;
    });

    // 3. Застосовуємо сортування (Завдання 1)
    filteredDogs.sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name); // Алфавітне сортування для рядків
        } else {
            return a[sortBy] - b[sortBy]; // Числове сортування (вага, висота, вік)
        }
    });

    // 4. Виводимо результат
    renderDogs(filteredDogs);
}

// Функція малювання карток порід
function renderDogs(dogsToRender) {
    // Очищаємо контейнер
    dogListContainer.innerHTML = '';

    if (dogsToRender.length === 0) {
        dogListContainer.innerHTML = '<p>За вашим запитом нічого не знайдено.</p>';
        return;
    }

    // Створюємо картку для кожної собаки
    dogsToRender.forEach(dog => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${dog.name} (${dog.group})</h3>
            <p><strong>Вага:</strong> ${dog.weight} кг | <strong>Висота:</strong> ${dog.height} см | <strong>Тривалість життя:</strong> ${dog.lifespan} років</p>
            <p>${dog.desc}</p>
        `;
        dogListContainer.appendChild(card);
    });
}

// Додаємо слухачів подій до всіх елементів управління
searchInput.addEventListener('input', updateUI);
groupFilter.addEventListener('change', updateUI);
weightFilter.addEventListener('input', updateUI);
sortSelect.addEventListener('change', updateUI);

// Ініціалізація списку при першому завантаженні сторінки
updateUI();