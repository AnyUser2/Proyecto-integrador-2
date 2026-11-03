const crud = require('./crud.factory');
const Director = require('../models/Director');

module.exports = crud(Director, {
  label: 'Director',
  fields: ['nombres', 'estado'],
  mediaField: 'director',
});
