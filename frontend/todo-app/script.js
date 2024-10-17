const formEl = document.getElementById("form");
const inputTextEl = document.getElementById("inputText");
const todoUlEl = document.getElementById("todo");
const leftEl = document.getElementById("left");
const activeTodo = document.getElementById("active");
const allBtn = document.getElementById("all");
const completedBtn = document.getElementById("completed");
const clrcompletedBtn = document.getElementById("clrcompleted");
const submitBtn = document.getElementById("submit");
const darkModeBtn = document.getElementById("darkMode");
const body = document.querySelector("body");

let editFlag = false;
let editEl = "";
let editValue = "";
let isCompleted = false;
let editid = "";
let delId = "";

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo();
});

function addTodo() {
  const id = new Date().getTime().toString(16).slice(5, 11);
  if (inputTextEl.value && !editFlag && !inputTextEl.value.match(/^\s*$/g)) {
    createElement(inputTextEl.value, id, isCompleted);

    setLocal(inputTextEl.value, id, isCompleted);

    inputTextEl.value = "";
    leftTodo();
  } else if (inputTextEl.value && editFlag) {
    let currentEl = editEl.querySelector("p");
    currentEl.innerHTML = inputTextEl.value;
    editLocal(inputTextEl.value, editid);
    editFlag = false;
    submitBtn.innerHTML = "Add Todo";
    inputTextEl.value = "";
  } else if (inputTextEl.value.match(/^\s*$/g)) {
    inputTextEl.value = ``;
  }
}

function createElement(value, id, isCompleted) {
  const li = document.createElement("li");
  const attr = document.createAttribute("data-id");
  attr.value = id;
  const completed = document.createAttribute("data-isCompleted");
  completed.value = isCompleted;
  const todoLeft = document.createElement("div");
  todoLeft.classList.add("todoLeft");
  const comBtn = document.createElement("button");

  comBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="9"><path fill="none" stroke="#FFF" stroke-width="2" d="M1 4.304L3.696 7l6-6"/></svg>`;

  todoLeft.appendChild(comBtn);
  li.appendChild(todoLeft);
  const para = document.createElement("p");
  para.innerHTML = value;
  todoLeft.appendChild(para);
  const icons = document.createElement("icons");
  icons.classList.add("icons");
  const editBtn = document.createElement("button");
  editBtn.innerHTML = `<ion-icon name="create"></ion-icon>`;
  editBtn.setAttribute("id", "edit");
  icons.appendChild(editBtn);
  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = `<ion-icon name="trash"></ion-icon>`;
  deleteBtn.setAttribute("id", "delete");
  icons.appendChild(deleteBtn);
  li.appendChild(icons);
  li.setAttributeNode(attr);
  li.setAttributeNode(completed);
  todoUlEl.prepend(li);

  //   Functions
  // isCompleted

  comBtn.addEventListener("click", (e) => {
    let crntEl = e.currentTarget.parentElement.parentElement;

    let check = JSON.parse(crntEl.dataset.iscompleted);

    crntEl.dataset.iscompleted = check ? false : true;

    let id = crntEl.dataset.id;

    localCompleted(id, crntEl.dataset.iscompleted);

    leftTodo();
  });

  // EditBtn

  editBtn.addEventListener("click", (e) => {
    editFlag = true;
    editEl = e.currentTarget.parentElement.parentElement;
    inputTextEl.value = editEl.querySelector("p").textContent;
    inputTextEl.focus();
    editid = editEl.dataset.id;
    submitBtn.innerHTML = "Edit Todo";
  });

  deleteBtn.addEventListener("click", (e) => {
    let delEl = e.currentTarget.parentElement.parentElement;
    delId = delEl.dataset.id;
    delLocal(id);
    leftTodo();
    delEl.remove();
  });
}

// Get local

function getLocal() {
  return localStorage.getItem("TodoApp")
    ? JSON.parse(localStorage.getItem("TodoApp"))
    : [];
}

function setLocal(value, id, isCompleted) {
  const saveLocal = { value, id, isCompleted };
  const local = getLocal();
  local.push(saveLocal);
  localStorage.setItem("TodoApp", JSON.stringify(local));
}

function localCompleted(id, completed) {
  let local = getLocal();

  local = local.map((item) => {
    if (item.id === id) {
      item.isCompleted = completed;
    }
    return item;
  });
  return localStorage.setItem("TodoApp", JSON.stringify(local));
}

function createLocal(value, id, iscompleted) {
  let local = getLocal();
  if (local.length >= 0) {
    local.forEach((item) => {
      let itemValue = item.value;
      let itemId = item.id;
      let itemCompleted = item.isCompleted;

      createElement(itemValue, itemId, itemCompleted);
    });
  }
}

createLocal();

function editLocal(value, id) {
  let local = getLocal();
  local.map((item) => {
    if (item.id == id) {
      item.value = value;
    }
    return item;
  });
  localStorage.setItem("TodoApp", JSON.stringify(local));
}

function delLocal(id) {
  let local = getLocal();

  local = local.filter((item) => {
    return item.id !== id;
  });

  localStorage.setItem("TodoApp", JSON.stringify(local));
}

function leftTodo() {
  let local = getLocal();
  local = local.filter((item) => {
    return JSON.parse(item.isCompleted) === false;
  });
  return (leftEl.innerHTML = local.length);
}

leftTodo();

activeTodo.addEventListener("click", (e) => {
  let local = getLocal();
  local = local.filter((item) => {
    return JSON.parse(item.isCompleted) === false;
  });
  todoUlEl.innerHTML = ``;
  allBtn.classList.remove("active");
  activeTodo.classList.add("active");
  completedBtn.classList.remove("active");
  if (local.length > 0) {
    local.forEach((item) => {
      createElement(item.value, item.id, item.isCompleted);
    });
  } else {
    todoUlEl.innerHTML = `<p style="text-align:center; padding:10px; color:#fff">No Active work todo.</p>`;
  }
});

allBtn.addEventListener("click", (e) => {
  todoUlEl.innerHTML = "";
  createLocal();
  allBtn.classList.add("active");
  activeTodo.classList.remove("active");
  completedBtn.classList.remove("active");
});

completedBtn.addEventListener("click", (e) => {
  let local = getLocal();
  local = local.filter((item) => {
    return JSON.parse(item.isCompleted) === true;
  });
  todoUlEl.innerHTML = ``;
  allBtn.classList.remove("active");
  activeTodo.classList.remove("active");
  completedBtn.classList.add("active");
  if (local.length > 0) {
    local.forEach((item) => {
      createElement(item.value, item.id, item.isCompleted);
    });
  } else {
    todoUlEl.innerHTML = `<p style="text-align:center; padding:10px; color:#fff">No work completed</p>`;
  }
});

clrcompletedBtn.addEventListener("click", (e) => {
  let local = getLocal();

  local = local.filter((item) => {
    return JSON.parse(item.isCompleted) === false;
  });
  localStorage.setItem("TodoApp", JSON.stringify(local));
  todoUlEl.innerHTML = ``;
  createLocal();
  allBtn.click();
});

darkModeBtn.addEventListener("click", (e) => {
  body.classList.toggle("darkMode");
});

// drag and drop
let drapBox = document.getElementById("todo");

new Sortable(drapBox, {
  animation: 400
});


