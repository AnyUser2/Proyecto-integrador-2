const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');

// Construye el router estándar CRUD a partir de un controlador
module.exports = (c) => {
  const router = Router();
  router.get('/', c.listar);
  router.get('/:id', validateObjectId, c.obtener);
  router.post('/', c.crear);
  router.put('/:id', validateObjectId, c.actualizar);
  router.delete('/:id', validateObjectId, c.eliminar);
  return router;
};
