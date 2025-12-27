const STORAGE = "gsap_todos";

const state = {
  tasks: JSON.parse(localStorage.getItem(STORAGE)) || [],
  filter: "all",
  sort: "date"
};

const $ = id => document.getElementById(id);

function save() {
  localStorage.setItem(STORAGE, JSON.stringify(state.tasks));
}

function uid() {
  return crypto.randomUUID();
}


function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  gsap.to(t, { opacity: 1, y: 0, duration: 0.3 });
  setTimeout(() => {
    gsap.to(t, { opacity: 0, y: 10, duration: 0.3 });
  }, 2000);
}


function addTask(data) {
  state.tasks.push({
    id: uid(),
    completed: false,
    createdAt: Date.now(),
    ...data
  });
  save();
  render();
  toast("Task added");
}

function updateTask(id, patch) {
  const task = state.tasks.find(t => t.id === id);
  Object.assign(task, patch);
  save();
  render();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  save();
  render();
  toast("Task deleted");
}


function visibleTasks() {
  let tasks = [...state.tasks];

  if (state.filter !== "all") {
    tasks = tasks.filter(t =>
      state.filter === "completed" ? t.completed : !t.completed
    );
  }

  if (state.sort === "priority") {
    const p = { high: 1, medium: 2, low: 3 };
    tasks.sort((a, b) => p[a.priority] - p[b.priority]);
  } else {
    tasks.sort((a, b) => b.createdAt - a.createdAt);
  }

  return tasks;
}

// rendering
function render() {
  const list = $("taskList");
  list.innerHTML = "";

  visibleTasks().forEach(task => {
    const li = document.createElement("li");
    li.className = `task ${task.priority} ${task.completed ? "completed" : ""}`;
    li.draggable = true;

    const title = document.createElement("span");
    title.textContent = task.title;

    title.onclick = () => {
      gsap.to(li, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () =>
          updateTask(task.id, { completed: !task.completed })
      });
    };

    const actions = document.createElement("div");
    actions.className = "actions";

    const del = document.createElement("button");
    del.textContent = "🗑️";
    del.onclick = () => {
      gsap.to(li, {
        opacity: 0,
        height: 0,
        padding: 0,
        duration: 0.25,
        onComplete: () => deleteTask(task.id)
      });
    };

    actions.appendChild(del);
    li.append(title, actions);
    list.appendChild(li);

    gsap.from(li, { opacity: 0, y: 10, duration: 0.25 });
  });

  updateStats();
}

function updateStats() {
  const total = state.tasks.length;
  const done = state.tasks.filter(t => t.completed).length;
  $("stats").textContent = `${done} / ${total} completed`;
}


$("taskForm").onsubmit = e => {
  e.preventDefault();
  addTask({
    title: title.value,
    dueDate: dueDate.value,
    priority: priority.value
  });
  e.target.reset();
};

$("filter").onchange = e => {
  state.filter = e.target.value;
  render();
};

$("sort").onchange = e => {
  state.sort = e.target.value;
  render();
};

$("clearCompleted").onclick = () => {
  state.tasks = state.tasks.filter(t => !t.completed);
  save();
  render();
  toast("Completed tasks cleared");
};


render();
