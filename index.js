const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
require('dotenv').config();

const Person = require('./models/person');

// const requestLogger = (req, res, next) => {
//   console.log('Method:', req.method);
//   console.log('Path:  ', req.path);
//   console.log('Body:  ', req.body);
//   console.log('---');
//   next();
// };

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (err, req, res, next) => {
  if (err.name === 'CastError') {
    return res.status(404).send({
      error: 'malformattered id',
    });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: err.message,
    });
  }
  next(err);
};
app.use(cors());
app.use(express.json());
// app.use(requestLogger);
app.use(express.static('build'));

morgan.token('body', (req) => JSON.stringify(req.body));

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
);

const persons = [];

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((p) => res.json(p))
    .catch((err) => next(err));
});

app.get('/info', (req, res, next) => {
  Person.find({})
    .then((p) => res.send(`<p>Phonebook has info for ${p.length} people</p> 
            <p>${new Date()}</p>`))
    .catch((err) => next(err));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      res.json(person);
    })
    .catch((err) => next(err));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    {
      new: true,
      runValidators: true,
      context: 'query',
    },
  )
    .then((updatedNote) => {
      res.json(updatedNote);
    })
    .catch((err) => next(err));
});

app.post('/api/persons', (req, res, next) => {
  const { body } = req;

  const checkPerson = persons.find((person) => person.name === body.name);

  if (!body.name) {
    return res.status(400).json({
      error: 'Name missing',
    });
  }
  if (!body.number) {
    return res.status(400).json({
      error: 'Number missing',
    });
  }
  if (checkPerson) {
    return res.status(409).json({
      error: 'name must be unique',
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  return person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson);
    })
    .catch((err) => next(err));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
