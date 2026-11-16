const crud = require('./crud.factory');
const Genero = require('../models/Genero');

module.exports = crud(Genero, {
  label: 'Género',
  fields: ['nombre', 'estado', 'descripcion'],
  mediaField: 'genero',
});
