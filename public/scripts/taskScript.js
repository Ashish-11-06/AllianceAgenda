
document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');

    const urlParams = new URLSearchParams(window.location.search);
    const assignedBy = urlParams.get('id');
    const assignedToSelect = document.getElementById('assigned_to');


    assignedToSelect.addEventListener('click', () => {
    fetch('/fetch-data')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        return response.json();
    })
    .then(users => {
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.user_id;
            option.textContent = `${user.user_id} ${user.firstname} ${user.lastname}`;
            assignedToSelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching users:', error.message);
        alert('Error fetching users: ' + error.message);
    });
});

    fetchTasks();

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const task = {
            Ttitle: document.getElementById('Ttitle').value,
            description: document.getElementById('description').value,
            dueDate: document.getElementById('dueDate').value,
            priority: document.getElementById('priority').value,
            // assigned_to: document.getElementById('assigned_to').value,
            assigned_to: assignedToSelect.value,
            // assigned_by: document.getElementById('assigned_by').value,
            assigned_by: assignedBy 
        };

        console.log('Task data being sent:', task);

        fetch('/task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            addTaskToList(data);
            taskForm.reset();
        })
        .catch(error => {
            alert('Error adding task: ' + error.message);
        });
    });

    function fetchTasks() {
        fetch('/fetch-task')
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(tasks => {
                tasks.forEach(task => addTaskToList(task));
            })
            .catch(error => {
                if (error.message.startsWith('<!DOCTYPE')) {
                    console.error('Server returned an HTML response instead of JSON. Possible server error or misconfiguration.');
                } else {
                    console.error('Error fetching tasks:', error.message);
                }
                alert('Error fetching tasks: ' + error.message);
            });
    }

    function addTaskToList(task) {
        const taskElement = document.createElement('div');
        // taskElement.classList.add('task-container');
        taskElement.dataset.id = task.id;

        const Ttitle = task.Ttitle || task.title || 'No Title';

        taskElement.innerHTML = `
        <div class="announcement-container">
        <div class="task-container">
            <h6 class="task-title">${Ttitle}</h6>
            <p class="task-content">${task.description}</p>
            <p class="task-content">Due: ${task.dueDate}</p>
            <p class="task-content">Priority: ${task.priority}</p>
            <p class="task-created-by">Assigned to: ${task.assigned_to}</p>
            <p class="task-created-by">Assigned by: ${task.assigned_by}</p>
            <p class="task-created-at">Status: ${task.status}</p>
            <div class="task-buttons">
                <button class="complete">Complete</button>
                <button class="delete">Delete</button>
            </div>
            <hr class="task-separator" />
            </div>
            </div>
        `;

        taskElement.querySelector('.complete').addEventListener('click', () => {
            updateTaskStatus(task.id, 'Completed');
        });

        taskElement.querySelector('.delete').addEventListener('click', () => {
            deleteTask(task.id, taskElement);
        });

        taskList.appendChild(taskElement);
    }

    function updateTaskStatus(id, status) {
        fetch(`/task/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update task status');
            }
            return response.json();
        })
        .then(updatedTask => {
            const taskItem = taskList.querySelector(`[data-id='${updatedTask.id}']`);
            if (taskItem) {
                taskItem.querySelector('.task-title').textContent = updatedTask.title;
                taskItem.querySelector('.task-content').innerHTML = `
                   
                    Status: ${updatedTask.status}
                `;
            }
        })
        .catch(error => {
            alert('Error updating task status: ' + error.message);
        });
    }

    function deleteTask(id, taskElement) {
        fetch(`/task/${id}`, {
            method: 'DELETE',
        })
        .then(() => {
            taskElement.remove();
        });
    }
});