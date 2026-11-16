const Media = require('../models/Media');
const asyncHandler = require('../middlewares/asyncHandler');

const httpError = (status, message) => Object.assign(new Error(message), { status });

/**
 * Genera los controladores CRUD para los módulos simples
 * (Género, Director, Productora y Tipo).
 *
 * @param {Model}    Model       Modelo de Mongoose
 * @param {string}   label       Nombre legible del recurso (para mensajes)
 * @param {string[]} fields      Campos permitidos en POST/PUT
 * @param {string}   mediaField  Campo de Media que referencia este recurso
 */
module.exports = (Model, { label, fields, mediaField }) => {
  const pick = (body) =>
    fields.reduce((acc, f) => {
      if (body[f] !== undefined) acc[f] = body[f];
      return acc;
    }, {});

  const listar = asyncHandler(async (req, res) => {
    const filtro = {};
    if (req.query.estado && Model.schema.path('estado')) filtro.estado = req.query.estado;
    const datos = await Model.find(filtro).sort({ fechaCreacion: -1 });
    res.json({ ok: true, total: datos.length, datos });
  });

  const obtener = asyncHandler(async (req, res) => {
    const dato = await Model.findById(req.params.id);
    if (!dato) throw httpError(404, `${label} no encontrado`);
    res.json({ ok: true, datos: dato });
  });

  const crear = asyncHandler(async (req, res) => {
    const dato = await Model.create(pick(req.body));
    res.status(201).json({ ok: true, mensaje: `${label} creado correctamente`, datos: dato });
  });

  const actualizar = asyncHandler(async (req, res) => {
    const dato = await Model.findById(req.params.id);
    if (!dato) throw httpError(404, `${label} no encontrado`);
    dato.set(pick(req.body));
    await dato.save(); // ejecuta validadores y actualiza fechaActualizacion
    res.json({ ok: true, mensaje: `${label} actualizado correctamente`, datos: dato });
  });

  const eliminar = asyncHandler(async (req, res) => {
    const dato = await Model.findById(req.params.id);
    if (!dato) throw httpError(404, `${label} no encontrado`);

    const enUso = await Media.countDocuments({ [mediaField]: dato._id });
    if (enUso > 0) {
      throw httpError(
        409,
        `No se puede eliminar: ${label} está asociado a ${enUso} producción(es). Puede inactivarlo en su lugar.`
      );
    }
    await dato.deleteOne();
    res.json({ ok: true, mensaje: `${label} eliminado correctamente` });
  });

  return { listar, obtener, crear, actualizar, eliminar };
};
