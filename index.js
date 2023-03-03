const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.json());

morgan.token('body', (req) => {
  return JSON.stringify(req.body);
});

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/api/persons', (_, res) => {
  res.json(persons);
});

app.get('/info', (_, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p> 
            <p>${new Date()}</p>`);
});

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id * 1;
  const note = persons.find((note) => note.id === id);
  note ? res.json(note) : res.status(404).end();
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

  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 10000000000000000),
  };

  persons = persons.concat(person);
  res.json(person);
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
