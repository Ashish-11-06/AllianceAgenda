document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');

    fetchTasks();

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const task = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            dueDate: document.getElementById('dueDate').value,
            priority: document.getElementById('priority').value,
            assigned_to: document.getElementById('assigned_to').value,
            assigned_by: document.getElementById('assigned_by').value
        };

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
        const li = document.createElement('li');
        li.dataset.id = task.id;
        const span = document.createElement('span');
        span.innerHTML = `<strong>${task.title}</strong> - ${task.description} (Due: ${task.dueDate}, Priority: ${task.priority}, Assigned to: ${task.assigned_to}, Assigned by: ${task.assigned_by}) - Status: ${task.status || 'Pending'}`;
        
        li.appendChild(span);

        const buttonsDiv = document.createElement('div');
        ['complete', 'delete'].forEach(action => {
        // ['complete', 'edit', 'delete'].forEach(action => { //if wants to add edit option
            const button = document.createElement('button');
            button.textContent = action.charAt(0).toUpperCase() + action.slice(1);
            button.classList.add(action);
            button.addEventListener('click', () => {
                if (action === 'complete') updateTaskStatus(task.id, 'Completed');
                if (action === 'edit') editTask(task);
                if (action === 'delete') deleteTask(task.id, li);
            });
            buttonsDiv.appendChild(button);
        });

        li.appendChild(buttonsDiv);
        taskList.appendChild(li);
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
                taskItem.querySelector('span').innerHTML = `<strong>${updatedTask.title}</strong> - ${updatedTask.description} (Due: ${updatedTask.formattedDueDate}, Priority: ${updatedTask.priority}, Assigned to: ${updatedTask.assigned_to}, Assigned by: ${updatedTask.assigned_by}) - Status: ${updatedTask.status}`;
            }
        })
        .catch(error => {
            alert('Error updating task status: ' + error.message);
        });
    }

    function editTask(task) {
        const newTitle = prompt('Edit Task Title', task.title);
        const newDescription = prompt('Edit Task Description', task.description);
        const newDueDate = prompt('Edit Due Date', task.dueDate);
        const newPriority = prompt('Edit Priority', task.priority);
        const newAssignedTo = prompt('Edit Assigned To', task.assigned_to);
        const newAssignedBy = prompt('Edit Assigned By', task.assigned_by);

        fetch(`/task/${task.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: newTitle,
                description: newDescription,
                dueDate: newDueDate,
                priority: newPriority,
                assigned_to: newAssignedTo,
                assigned_by: newAssignedBy,
            }),
        })
        .then(response => response.json())
        .then(updatedTask => {
            const taskItem = taskList.querySelector(`[data-id='${updatedTask.id}']`);
            taskItem.querySelector('span').innerHTML = `<strong>${updatedTask.title}</strong> - ${updatedTask.description} (Due: ${updatedTask.dueDate}, Priority: ${updatedTask.priority}, Assigned to: ${updatedTask.assigned_to}, Assigned by: ${updatedTask.assigned_by}) - Status: ${updatedTask.status}`;
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
