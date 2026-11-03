const notFound = (req, res) => {
  res.status(404).json({ ok: false, mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errores = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ ok: false, mensaje: 'Error de validación', errores });
  }
  // Valor duplicado (campos unique)
  if (err.code === 11000) {
    const campos = Object.keys(err.keyValue || {}).join(', ');
    return res.status(409).json({ ok: false, mensaje: `Ya existe un registro con el mismo valor en: ${campos}` });
  }
  // ObjectId mal formado
  if (err.name === 'CastError') {
    return res.status(400).json({ ok: false, mensaje: `Valor inválido para el campo "${err.path}"` });
  }
  // Error propio con status
  if (err.status) {
    return res.status(err.status).json({ ok: false, mensaje: err.message });
  }
  // JSON mal formado
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, mensaje: 'El cuerpo de la petición no es un JSON válido' });
  }
  console.error(err);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
};

module.exports = { notFound, errorHandler };
