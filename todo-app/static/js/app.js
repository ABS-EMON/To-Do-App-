const API = '/api/todos';
let todos = [];
let currentFilter = 'all';
let editingId = null;

// ── Fetch & render ───────────────────────────────────────────────
async function fetchTodos() {
  const res = await fetch(API);
  todos = await res.json();
  render();
}

function render() {
  const list = document.getElementById('todo-list');
  const empty = document.getElementById('empty-state');

  const filtered = todos.filter(t => {
    if (currentFilter === 'pending')   return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  updateStats();

  if (filtered.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = filtered.map(todo => `
    <div class="todo-card priority-${todo.priority} ${todo.completed ? 'completed-card' : ''}" id="card-${todo.id}">
      <div class="todo-check ${todo.completed ? 'checked' : ''}" onclick="toggleTodo('${todo.id}')">
        ${todo.completed ? '<i class="fa-solid fa-check"></i>' : ''}
      </div>
      <div class="todo-content">
        <div class="todo-title">${escHtml(todo.title)}</div>
        <div class="todo-meta">
          <span class="badge badge-cat">${escHtml(todo.category)}</span>
          <span class="badge badge-${todo.priority}">${todo.priority.charAt(0).toUpperCase()+todo.priority.slice(1)}</span>
        </div>
      </div>
      <div class="todo-actions">
        <button class="action-btn edit" onclick="openEdit('${todo.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
        <button class="action-btn del"  onclick="deleteTodo('${todo.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function updateStats() {
  const total = todos.length;
  const done  = todos.filter(t => t.completed).length;
  const pend  = total - done;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  document.getElementById('count-total').textContent   = total;
  document.getElementById('count-done').textContent    = done;
  document.getElementById('count-pending').textContent = pend;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent = pct + '% complete';
}

// ── Add ──────────────────────────────────────────────────────────
async function addTodo() {
  const input = document.getElementById('todo-input');
  const title = input.value.trim();
  if (!title) { input.focus(); input.classList.add('shake'); setTimeout(() => input.classList.remove('shake'), 400); return; }

  const body = {
    title,
    priority: document.getElementById('priority-select').value,
    category: document.getElementById('category-select').value
  };

  await fetch(API, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  input.value = '';
  await fetchTodos();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('todo-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTodo();
  });
  fetchTodos();
});

// ── Toggle ───────────────────────────────────────────────────────
async function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ completed: !todo.completed })
  });
  const card = document.getElementById(`card-${id}`);
  if (card) { card.classList.add('flash'); }
  await fetchTodos();
}

// ── Delete ───────────────────────────────────────────────────────
async function deleteTodo(id) {
  const card = document.getElementById(`card-${id}`);
  if (card) {
    card.style.animation = 'pop-out .25s ease forwards';
    await new Promise(r => setTimeout(r, 250));
  }
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  await fetchTodos();
}

// ── Clear completed ──────────────────────────────────────────────
async function clearCompleted() {
  await fetch(`${API}/clear`, { method: 'DELETE' });
  await fetchTodos();
}

// ── Filter ───────────────────────────────────────────────────────
function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

// ── Edit modal ───────────────────────────────────────────────────
function openEdit(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  editingId = id;
  document.getElementById('edit-input').value    = todo.title;
  document.getElementById('edit-priority').value = todo.priority;
  document.getElementById('edit-category').value = todo.category;
  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('edit-input').focus(), 100);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  editingId = null;
}

async function saveEdit() {
  if (!editingId) return;
  const body = {
    title:    document.getElementById('edit-input').value.trim(),
    priority: document.getElementById('edit-priority').value,
    category: document.getElementById('edit-category').value
  };
  if (!body.title) return;
  await fetch(`${API}/${editingId}`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  closeModal();
  await fetchTodos();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── Utility ──────────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
