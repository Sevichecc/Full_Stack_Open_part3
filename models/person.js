const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

// console.log('Connecting to', url)

mongoose
  .connect(url)
  .then(() => console.log('connected to MongoDB'))
  .catch((err) => console.log('error connecting to MongoDB:', err.message));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'Name must be at least 3 characters'],
    required: [true, 'Person\'s name is required'],
  },
  number: {
    type: String,
    minLength: [8, 'Phone number must be at least 8 characters'],
    required: [true, 'Phone number is required'],
    validate: {
      validator(v) {
        return /^\d{2}\d?-\d{5,}$/.test(v);
      },
      message: (props) => {
        `${props.value} is not a valid phone number!`;
      },
    },
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
