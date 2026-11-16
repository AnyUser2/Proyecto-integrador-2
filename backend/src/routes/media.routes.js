const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const c = require('../controllers/media.controller');

const router = Router();

router.get('/', c.listar);
router.get('/serial/:serial', c.obtenerPorSerial); // debe ir antes de '/:id'
router.get('/:id', validateObjectId, c.obtener);
router.post('/', c.crear);
router.put('/:id', validateObjectId, c.actualizar);
router.delete('/:id', validateObjectId, c.eliminar);

module.exports = router;
