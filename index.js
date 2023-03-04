const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
require('dotenv').config();

const Person = require('./models/person');

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static('build'));

morgan.token('body', (req) => {
  return JSON.stringify(req.body);
});

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

let persons = [];

app.get('/api/persons', (_, res) => {
  Person.find({}).then((persons) => res.json(persons));
});

app.get('/info', (_, res) => {
  Person.find({}).then((persons) =>
    res.send(`<p>Phonebook has info for ${persons.length} people</p> 
            <p>${new Date()}</p>`)
  );
});

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then((person) => {
    res.json(person);
  });
});

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id * 1;
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

app.post('/api/persons', (req, res) => {
  const { body } = req;

  const checkPerson = persons.find((person) => person.name === body.name);

  if (!body.name) {
    return res.status(400).json({
      error: 'Name missing',
    });
  } else if (!body.number) {
    return res.status(400).json({
      error: 'Number missing',
    });
  } else if (checkPerson) {
    return res.status(409).json({
      error: 'name must be unique',
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 10000000000000000),
  });

  person.save().then((savedPerson) => {
    res.json(savedPerson);
  });
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
