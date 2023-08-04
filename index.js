const refs = {
  tasksList: document.querySelector('#tasksList'),
  title: document.querySelector('#title'),
  modals: {
    create: document.querySelector('#createTaskModal'),
    edit: document.querySelector('#editTaskModal'),
    remove: document.querySelector('#removeTaskModal'),
  },
  forms: {
    create: document.querySelector('#createTaskForm'),
    edit: document.querySelector('#editTaskForm'),
    remove: document.querySelector('#removeTaskForm'),
  },
};

const tasksData = [];

let idCounter = 0;
const getNewId = () => (++idCounter).toString();

const icons = {
  task: '<i class="fa-regular fa-note-sticky"></i>',
  idea: '<i class="fa-regular fa-lightbulb"></i>',
};

let activeModalRef = null;
let taskToEdit = null;
let taskToRemove = null;
let isArchiveOpen = false;

function openModal(ref) {
  if (activeModalRef) {
    closeModal();
  }

  activeModalRef = ref;
  ref.classList.add('is-active');
  document.body.classList.add('is-clipped');
}

function closeModal() {
  if (!activeModalRef) {
    return;
  }

  activeModalRef.classList.remove('is-active');
  document.body.classList.remove('is-clipped');

  activeModalRef = null;
}

function createTaskHTML(task) {
  const taskClasses = ['card'];
  if (task.isArchived) {
    taskClasses.push('is-archived');
  }

  return `
    <li id="task_${task.id}" class="${taskClasses.join(' ')}">
      <div class="card-content">
        <div class="is-flex is-align-items-center">
          <span class="mr-1 js-icon">${icons[task.category]}</span>
          <h4 class="title is-capitalized js-category">${task.category}</h4>
        </div>
        <p class="subtitle js-text">${task.text}</p>
        <div>
          <button type="button" data-editid="${
            task.id
          }" class="button is-light">Edit</button>
          <button type="button" data-archiveid="${
            task.id
          }" class="button is-warning">Archive</button>
          <button type="button" class="button is-danger" data-removeid="${
            task.id
          }">Remove</button>
        </div>
      </div>
    </li>
  `;
}

function getTaskRefById(id) {
  return document.querySelector(`#task_${id}`);
}

function createTask(text, category) {
  const newTask = {
    id: getNewId(),
    text,
    category,
    isArchived: false,
  };
  tasksData.push(newTask);

  // Don't render new task if archive is open
  if (!isArchiveOpen) {
    refs.tasksList.insertAdjacentHTML('beforeend', createTaskHTML(newTask));
  }

  closeModal();
}

function updateTask(text, category) {
  // Update task object
  taskToEdit.text = text;
  taskToEdit.category = category;

  // Find task card
  const taskRef = getTaskRefById(taskToEdit.id);

  // Update card html
  taskRef.querySelector('.js-icon').innerHTML = icons[category];
  taskRef.querySelector('.js-category').textContent = category;
  taskRef.querySelector('.js-text').textContent = text;

  // Reset variable and close modal
  taskToEdit = null;
  closeModal();
}

function removeTask() {
  tasksData.splice(tasksData.indexOf(taskToRemove), 1);
  const taskRef = getTaskRefById(taskToRemove.id);
  taskRef.remove();
  closeModal();
}

function renderTasks() {
  refs.tasksList.innerHTML = '';
  tasksData.forEach((task) => {
    if (task.isArchived === isArchiveOpen) {
      refs.tasksList.insertAdjacentHTML('beforeend', createTaskHTML(task));
    }
  });
}

window.addEventListener('click', (e) => {
  // Close modal on cross btn or modal background click
  if (
    e.target.classList.contains('modal-close') ||
    e.target.classList.contains('modal-background') ||
    e.target.classList.contains('modal-close-btn')
  ) {
    closeModal();
  }

  const { editid, removeid, archiveid } = e.target.dataset;
  // Populate edit form and open edit modal
  if (editid) {
    const task = tasksData.find((task) => task.id === editid);

    refs.forms.edit.elements.text.value = task.text;
    refs.forms.edit.elements.category.value = task.category;

    taskToEdit = task;

    openModal(refs.modals.edit);
  }

  // Save task to remove and open remove confirmation modal
  if (removeid) {
    const task = tasksData.find((task) => task.id === removeid);

    taskToRemove = task;

    openModal(refs.modals.remove);
  }

  // Archive task
  if (archiveid) {
    const task = tasksData.find((task) => task.id === archiveid);

    task.isArchived = !task.isArchived;
    const taskRef = getTaskRefById(task.id);
    taskRef.remove();
  }

  // Open create task modal
  if (e.target.id === 'createTaskBtn') {
    openModal(refs.modals.create);
  }

  // Toggle archive display
  if (e.target.id === 'toggleArchive') {
    isArchiveOpen = !isArchiveOpen;
    e.target.textContent = isArchiveOpen ? 'Show tasks' : 'Show archive';
    title.textContent = isArchiveOpen ? 'Archive' : 'Tasks';
    renderTasks();
  }
});

// Create form submit handler
refs.forms.create.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = e.target.elements.text.value;
  const category = e.target.elements.category.value;

  createTask(text, category);
});

// Edit form submit handler
refs.forms.edit.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = e.target.elements.text.value;
  const category = e.target.elements.category.value;

  updateTask(text, category);
});

// Remove form submit handler
refs.forms.remove.addEventListener('submit', (e) => {
  e.preventDefault();

  removeTask();
});
