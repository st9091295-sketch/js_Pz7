let todos = JSON.parse(localStorage.getItem('todos')) || [];

const listElement = document.getElementById('todo-list');
const totalCountElement = document.getElementById('total-count');
const uncheckedCountElement = document.getElementById('unchecked-count');

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

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
        
        console.log('Нова справа додана:', todo); 
    }
}

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
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    render();
    updateCounter();
}

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

render();
updateCounter();