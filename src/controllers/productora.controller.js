const crud = require('./crud.factory');
const Productora = require('../models/Productora');

module.exports = crud(Productora, {
  label: 'Productora',
  fields: ['nombre', 'estado', 'slogan', 'descripcion'],
  mediaField: 'productora',
});
