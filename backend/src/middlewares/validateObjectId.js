const mongoose = require('mongoose');

// Valida que el parámetro :id sea un ObjectId válido de MongoDB
module.exports = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ ok: false, mensaje: 'El id proporcionado no es válido' });
  }
  next();
};
