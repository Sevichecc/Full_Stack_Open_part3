const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://rainboiler:${password}@fullstackopen.dkg3ebc.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
});

person.save().then(() => {
  console.log(`added ${person.name} ${person.number} to phonebook`);
});

Person.find({}).then((result) => {
  console.log('phonebook:');
  result.forEach((person) => {
    console.log(person.name + ' ' + person.number);
  });
  mongoose.connection.close();
});
