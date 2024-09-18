// app.js

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const addElementBtn = document.getElementById('addElementBtn');
    const elementsContainer = document.getElementById('elementsContainer');
    const elementModalEl = document.getElementById('elementModal');
    const elementModal = new bootstrap.Modal(elementModalEl);
    const elementForm = document.getElementById('elementForm');
    const elementName = document.getElementById('elementName');
    const elementDescription = document.getElementById('elementDescription');
    const taskList = document.getElementById('taskList');
    const newTaskInput = document.getElementById('newTaskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const elementComments = document.getElementById('elementComments');
    const elementIdInput = document.getElementById('elementId');
  
    let elements = [];
    let currentElementId = null;
  
    // Load elements from local storage
    loadElements();
  
    // Event listener for adding new elements
    addElementBtn.addEventListener('click', () => {
      openElementModal();
    });
  
    // Event listener for submitting the element form
    elementForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveElement();
    });
  
    // Event listener for adding tasks
    addTaskBtn.addEventListener('click', addTask);
  
    // Functions
  
    function loadElements() {
      const storedElements = localStorage.getItem('elements');
      if (storedElements) {
        elements = JSON.parse(storedElements);
        renderElements();
      }
    }
  
    function saveElements() {
      localStorage.setItem('elements', JSON.stringify(elements));
    }
  
    function renderElements() {
      elementsContainer.innerHTML = '';
      elements.forEach((element) => {
        const item = document.createElement('div');
        item.className = 'list-group-item element-item';
        item.setAttribute('data-id', element.id);
  
        item.innerHTML = `
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="task-name">${element.name}</div>
              <div class="task-description">${element.description}</div>
            </div>
            <div class="task-actions">
              <button class="btn btn-sm btn-danger delete-btn">Delete</button>
            </div>
          </div>
        `;
  
        // Event listener for opening modal to edit element
        item.addEventListener('click', (e) => {
          if (e.target.classList.contains('delete-btn')) {
            // Do nothing, handled separately
            return;
          }
          openElementModal(element.id);
        });
  
        // Event listener for delete button
        item.querySelector('.delete-btn').addEventListener('click', () => {
          deleteElement(element.id);
        });
  
        elementsContainer.appendChild(item);
      });
  
      // Initialize drag and drop
      initDragAndDrop();
    }
  
    function openElementModal(id = null) {
      currentElementId = id;
  
      // Reset form
      elementForm.reset();
      taskList.innerHTML = '';
      newTaskInput.value = '';
  
      if (id) {
        // Edit existing element
        const element = elements.find((el) => el.id === id);
        elementName.value = element.name;
        elementDescription.value = element.description;
        elementComments.value = element.comments;
        elementIdInput.value = element.id;
  
        // Render tasks
        element.tasks.forEach((task, index) => {
          addTaskToList(task, index);
        });
      } else {
        // New element
        elementIdInput.value = '';
      }
  
      elementModal.show();
    }
  
    function saveElement() {
      const id = elementIdInput.value || Date.now().toString();
      const name = elementName.value.trim();
      const description = elementDescription.value.trim();
      const comments = elementComments.value.trim();
  
      if (!name) {
        alert('Name is required.');
        return;
      }
  
      const tasks = [];
      const taskItems = taskList.querySelectorAll('li');
      taskItems.forEach((item) => {
        tasks.push({
          description: item.querySelector('.task-desc').textContent,
          completed: item.querySelector('.form-check-input').checked,
        });
      });
  
      const elementData = {
        id,
        name,
        description,
        tasks,
        comments,
      };
  
      if (currentElementId) {
        // Update existing element
        const index = elements.findIndex((el) => el.id === currentElementId);
        elements[index] = elementData;
      } else {
        // Add new element
        elements.push(elementData);
      }
  
      saveElements();
      renderElements();
      elementModal.hide();
    }
  
    function addTask() {
      const taskDesc = newTaskInput.value.trim();
      if (taskDesc === '') {
        alert('Please enter a subtask description.');
        return;
      }
  
      const taskIndex = taskList.children.length;
      addTaskToList({ description: taskDesc, completed: false }, taskIndex);
      newTaskInput.value = '';
      newTaskInput.focus();
    }
  
    function addTaskToList(task, index) {
      const li = document.createElement('li');
      li.className =
        'list-group-item d-flex justify-content-between align-items-center draggable-task';
      li.setAttribute('data-index', index);
  
      li.innerHTML = `
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            ${task.completed ? 'checked' : ''}
          >
          <label class="form-check-label task-desc">
            ${task.description}
          </label>
        </div>
        <button class="btn btn-sm btn-danger">Delete</button>
      `;
  
      // Event listener for deleting task
      li.querySelector('.btn-danger').addEventListener('click', () => {
        li.remove();
      });
  
      taskList.appendChild(li);
    }
  
    function deleteElement(id) {
      if (confirm('Are you sure you want to delete this task?')) {
        elements = elements.filter((el) => el.id !== id);
        saveElements();
        renderElements();
      }
    }
  
    function initDragAndDrop() {
      new Sortable(elementsContainer, {
        animation: 150,
        onEnd: function (evt) {
          // Update elements array based on new order
          const newOrder = [];
          elementsContainer.querySelectorAll('.element-item').forEach((item) => {
            const id = item.getAttribute('data-id');
            const element = elements.find((el) => el.id === id);
            if (element) {
              newOrder.push(element);
            }
          });
          elements = newOrder;
          saveElements();
        },
      });
    }
  });