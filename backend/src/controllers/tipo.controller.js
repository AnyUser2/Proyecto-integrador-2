const crud = require('./crud.factory');
const Tipo = require('../models/Tipo');

module.exports = crud(Tipo, {
  label: 'Tipo',
  fields: ['nombre', 'descripcion'],
  mediaField: 'tipo',
});
