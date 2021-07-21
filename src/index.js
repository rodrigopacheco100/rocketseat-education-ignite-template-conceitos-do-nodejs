const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find(user => user.username === username);

  if (userExists) {
    next();
  }
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers

  const user = users.find(user => user.username === username);

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { title, deadline } = request.body

  const userIndex = users.findIndex(user => user.username === username);

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  users[userIndex].todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { id } = request.params
  const { title, deadline } = request.body

  const userIndex = users.findIndex(user => user.username === username);

  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0 ) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  users[userIndex].todos[todoIndex].title = title
  users[userIndex].todos[todoIndex].deadline = new Date(deadline)

  return response.status(200).json(users[userIndex].todos[todoIndex])
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { id } = request.params

  const userIndex = users.findIndex(user => user.username === username);

  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0 ) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  users[userIndex].todos[todoIndex].done = true

  return response.status(200).json(users[userIndex].todos[todoIndex])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { id } = request.params

  const userIndex = users.findIndex(user => user.username === username);

  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0 ) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  users[userIndex].todos.splice(todoIndex, 1)

  return response.status(204).send()
});

module.exports = app;