document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('task-input');
    const todoForm = document.getElementById('todo-form');
    const todoList = document.getElementById('todo-list');

    // Fetch tasks from the server
    async function fetchTasks() {
        const response = await fetch('https://my-backend.onrender.com/todos');

        const todos = await response.json();
        todos.forEach(todo => {
            addTaskToList(todo.task, todo._id, todo.completed, todo.createdAt, todo.completedAt);
        });
    }

    fetchTasks(); // Fetch tasks on page load

    // Add a new task
    todoForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText === '') return;

        const response = await fetch('http://localhost:5000/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: taskText })
        });

        const newTodo = await response.json();
        addTaskToList(newTodo.task, newTodo._id, newTodo.completed, newTodo.createdAt, newTodo.completedAt);
        taskInput.value = ''; // Clear input after adding task
    });

    // Function to create a new task item
    function addTaskToList(taskText, id, completed = false, createdAt, completedAt) {
        const li = document.createElement('li');
        const taskSpan = document.createElement('span');
        taskSpan.className = 'task';
        taskSpan.textContent = taskText;
        if (completed) taskSpan.classList.add('completed');

        const timeSpan = document.createElement('span');
        timeSpan.className = 'time-stamp';
        timeSpan.textContent = `Created: ${new Date(createdAt).toLocaleString()}` + (completedAt ? ` | Completed: ${new Date(completedAt).toLocaleString()}` : '');

        // Create buttons
        const editButton = document.createElement('button');
        editButton.className = 'edit-btn';
        editButton.textContent = 'Edit';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = 'Delete';

        const completeButton = document.createElement('button');
        completeButton.className = 'complete-btn';
        completeButton.textContent = 'Complete';

        // Append task, time, and buttons to list item
        li.appendChild(taskSpan);
        li.appendChild(timeSpan);
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        li.appendChild(completeButton);
        todoList.appendChild(li);

        // Event listeners for buttons
        editButton.addEventListener('click', async function() {
            const newTaskText = prompt('Edit your task:', taskSpan.textContent);
            if (newTaskText) {
                taskSpan.textContent = newTaskText;
                await fetch(`http://localhost:5000/todos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ task: newTaskText })
                });
            }
        });

        deleteButton.addEventListener('click', async function() {
            if (confirm('Are you sure you want to delete this task?')) {
                li.remove();
                await fetch(`http://localhost:5000/todos/${id}`, {
                    method: 'DELETE'
                });
            }
        });

        completeButton.addEventListener('click', async function() {
            taskSpan.classList.toggle('completed');
            const completed = taskSpan.classList.contains('completed');
            const completedAt = completed ? new Date().toISOString() : null;
            await fetch(`http://localhost:5000/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: completed, completedAt: completedAt })
            });
            timeSpan.textContent = `Created: ${new Date(createdAt).toLocaleString()}` + (completedAt ? ` | Completed: ${new Date(completedAt).toLocaleString()}` : '');
        });
    }
});
