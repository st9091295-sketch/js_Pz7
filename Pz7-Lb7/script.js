const DB_URL = 'https://lb-7-59273-default-rtdb.firebaseio.com/';

let todos = [];

const listElement = document.getElementById('todo-list');
const totalCountElement = document.getElementById('total-count');
const uncheckedCountElement = document.getElementById('unchecked-count');

function showLoading(isLoading) {
    document.getElementById('loading').style.display = isLoading ? 'block' : 'none';
}

function showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.textContent = message;
    errorEl.style.display = message ? 'block' : 'none';
}

function fetchTodos() {
    showLoading(true);
    showError('');
    fetch(`${DB_URL}.json`)
        .then(response => {
            if (!response.ok) throw new Error('Помилка завантаження даних з БД');
            return response.json();
        })
        .then(data => {
            todos = [];
            if (data) {
                Object.keys(data).forEach(key => {
                    todos.push({
                        id: key,
                        text: data[key].text,
                        checked: data[key].checked
                    });
                });
            }
            render();
            updateCounter();
        })
        .catch(err => showError(err.message))
        .finally(() => showLoading(false));
}

function newTodo() {
    const taskText = prompt('Введіть нове завдання:');
    
    if (taskText && taskText.trim() !== '') {
        const todoToAdd = {
            text: taskText.trim(),
            checked: false
        };
        
        showLoading(true);
        showError('');
        
        fetch(`${DB_URL}.json`, {
            method: 'POST',
            body: JSON.stringify(todoToAdd),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Помилка відправки в БД');
            return response.json();
        })
        .then(data => {
            const newTodoItem = {
                id: data.name,
                ...todoToAdd
            };
            todos.push(newTodoItem);
            render();
            updateCounter();
        })
        .catch(err => showError(err.message))
        .finally(() => showLoading(false));
    }
}

function renderTodo(todo) {
    return `
        <li class="todo-item">
            <input type="checkbox" id="todo-${todo.id}" 
                   ${todo.checked ? 'checked' : ''} 
                   onchange="checkTodo('${todo.id}')">
            <label for="todo-${todo.id}" 
                   style="${todo.checked ? 'text-decoration: line-through; color: gray;' : ''}">
                ${todo.text}
            </label>
            <button onclick="deleteTodo('${todo.id}')">Видалити</button>
        </li>
    `;
}

function render() {
    const todosHtml = todos.map(todo => renderTodo(todo)).join('');
    listElement.innerHTML = todosHtml; 
}

function updateCounter() {
    const total = todos.length; 
    const unchecked = todos.filter(todo => !todo.checked).length; 

    totalCountElement.textContent = total;
    uncheckedCountElement.textContent = unchecked;
}

function deleteTodo(id) {
    showLoading(true);
    showError('');
    
    fetch(`${DB_URL}/${id}.json`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Помилка видалення з БД');
        todos = todos.filter(todo => todo.id !== id);
        render();
        updateCounter();
    })
    .catch(err => showError(err.message))
    .finally(() => showLoading(false));
}

function checkTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    showLoading(true);
    showError('');

    fetch(`${DB_URL}/${id}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ checked: !todo.checked }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Помилка оновлення статусу в БД');
        todo.checked = !todo.checked;
        render();
        updateCounter();
    })
    .catch(err => showError(err.message))
    .finally(() => showLoading(false));
}

fetchTodos();