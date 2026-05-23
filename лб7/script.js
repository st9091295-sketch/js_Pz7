// Ініціалізація масиву об'єктів з Local Storage або створення порожнього [cite: 28, 43]
let todos = JSON.parse(localStorage.getItem('todos')) || [];

const listElement = document.getElementById('todo-list');
const totalCountElement = document.getElementById('total-count');
const uncheckedCountElement = document.getElementById('unchecked-count');

// Функція для збереження даних у Local Storage 
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 3. Функція додавання нової справи [cite: 29]
function newTodo() {
    const taskText = prompt('Введіть нове завдання:');
    
    if (taskText && taskText.trim() !== '') {
        const todo = {
            id: Date.now(),
            text: taskText.trim(),
            checked: false
        };
        
        todos.push(todo);
        saveTodos();
        render();
        updateCounter();
        
        // Перевірка збереження даних [cite: 30]
        console.log('Нова справа додана:', todo); 
    }
}

// 4. Функція створення розмітки для однієї справи за допомогою шаблонних рядків [cite: 31, 32]
function renderTodo(todo) {
    return `
        <li class="todo-item">
            <input type="checkbox" id="todo-${todo.id}" 
                   ${todo.checked ? 'checked' : ''} 
                   onchange="checkTodo(${todo.id})">
            <label for="todo-${todo.id}" 
                   style="${todo.checked ? 'text-decoration: line-through; color: gray;' : ''}">
                ${todo.text}
            </label>
            <button onclick="deleteTodo(${todo.id})">Видалити</button>
        </li>
    `;
}

// 5. Функція рендеру всього списку [cite: 33]
function render() {
    // Перетворення масиву об'єктів на масив HTML-рядків та об'єднання їх
    const todosHtml = todos.map(todo => renderTodo(todo)).join('');
    
    // Додавання розмітки до списку [cite: 34]
    listElement.innerHTML = todosHtml; 
}

// 6. Функція оновлення лічильників [cite: 35]
function updateCounter() {
    // Загальна кількість справ
    const total = todos.length; 
    
    // Кількість незроблених справ (використано метод filter) [cite: 36]
    const unchecked = todos.filter(todo => !todo.checked).length; 

    totalCountElement.textContent = total;
    uncheckedCountElement.textContent = unchecked;
}

// 7. Функція видалення справи [cite: 37]
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    render();
    updateCounter();
}

// 8. Функція відмітки виконання справи [cite: 38]
function checkTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, checked: !todo.checked };
        }
        return todo;
    });
    saveTodos();
    render();
    updateCounter();
}

// Початковий виклик функцій для відображення збережених даних при завантаженні сторінки
render();
updateCounter();