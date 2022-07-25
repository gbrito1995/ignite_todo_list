const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return status(400).json({ error: 'User not found.' });
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {

  const { name, username } = request.body;

  const userExists = users.some(element => element.username === username);

  if (userExists) {

    return response.status(400).json({ error: 'Username already in use.' })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { user } = request;

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const alterTodo = user.todos.find(element => element.id === id);

  if (!alterTodo) {

    return response.status(404).json({ error: 'Task does not exists.' });
  }

  alterTodo.title = title;
  alterTodo.deadline = deadline;

  return response.json(alterTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const { id } = request.params;
  const { user } = request;

  const taskDone = user.todos.find(element => element.id === id);

  if (!taskDone) {

    return response.status(404).json({ error: 'Task does not exists.' });
  }

  taskDone.done = true;

  return response.json(taskDone);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { user } = request;
  const { id } = request.params;

  const deleteTask = user.todos.find(element => element.id === id);

  if (!deleteTask) {

    return response.status(404).json({ error: 'Task does not exists.' });
  }

  user.todos.splice(deleteTask, 1);

  return response.status(204).json({ message: 'Task deleted.' });

});

module.exports = app;