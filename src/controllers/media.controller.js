const mongoose = require('mongoose');
const Media = require('../models/Media');
const Genero = require('../models/Genero');
const Director = require('../models/Director');
const Productora = require('../models/Productora');
const Tipo = require('../models/Tipo');
const asyncHandler = require('../middlewares/asyncHandler');

const httpError = (status, message) => Object.assign(new Error(message), { status });

const CAMPOS = ['serial', 'titulo', 'sinopsis', 'url', 'imagenPortada', 'anioEstreno', 'genero', 'director', 'productora', 'tipo'];

const POPULATE = [
  { path: 'genero', select: 'nombre estado' },
  { path: 'director', select: 'nombres estado' },
  { path: 'productora', select: 'nombre slogan estado' },
  { path: 'tipo', select: 'nombre' },
];

const pick = (body) =>
  CAMPOS.reduce((acc, f) => {
    if (body[f] !== undefined) acc[f] = body[f];
    return acc;
  }, {});

/**
 * Reglas de negocio:
 *  - Género, Director y Productora deben existir y estar ACTIVOS.
 *  - Tipo debe existir.
 * Solo valida los campos que vienen en `datos`.
 */
const validarReferencias = async (datos) => {
  const checks = [
    { campo: 'genero', Model: Genero, label: 'género', activo: true },
    { campo: 'director', Model: Director, label: 'director', activo: true },
    { campo: 'productora', Model: Productora, label: 'productora', activo: true },
    { campo: 'tipo', Model: Tipo, label: 'tipo', activo: false },
  ];

  for (const { campo, Model, label, activo } of checks) {
    if (datos[campo] === undefined) continue;
    if (!mongoose.Types.ObjectId.isValid(datos[campo])) {
      throw httpError(400, `El id de ${label} no es válido`);
    }
    const ref = await Model.findById(datos[campo]);
    if (!ref) throw httpError(400, `El ${label} seleccionado no existe`);
    if (activo && ref.estado !== 'Activo') {
      throw httpError(400, `El ${label} seleccionado está inactivo; solo se permiten registros activos`);
    }
  }
};

const listar = asyncHandler(async (req, res) => {
  const { genero, director, productora, tipo, anioEstreno, q } = req.query;
  const filtro = {};
  if (genero) filtro.genero = genero;
  if (director) filtro.director = director;
  if (productora) filtro.productora = productora;
  if (tipo) filtro.tipo = tipo;
  if (anioEstreno) filtro.anioEstreno = Number(anioEstreno);
  if (q) filtro.titulo = { $regex: String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

  const datos = await Media.find(filtro).populate(POPULATE).sort({ fechaCreacion: -1 });
  res.json({ ok: true, total: datos.length, datos });
});

const obtener = asyncHandler(async (req, res) => {
  const dato = await Media.findById(req.params.id).populate(POPULATE);
  if (!dato) throw httpError(404, 'Producción no encontrada');
  res.json({ ok: true, datos: dato });
});

const obtenerPorSerial = asyncHandler(async (req, res) => {
  const dato = await Media.findOne({ serial: req.params.serial }).populate(POPULATE);
  if (!dato) throw httpError(404, 'Producción no encontrada');
  res.json({ ok: true, datos: dato });
});

const crear = asyncHandler(async (req, res) => {
  const datos = pick(req.body);
  await validarReferencias(datos);
  const media = await Media.create(datos);
  await media.populate(POPULATE);
  res.status(201).json({ ok: true, mensaje: 'Producción creada correctamente', datos: media });
});

const actualizar = asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw httpError(404, 'Producción no encontrada');

  const datos = pick(req.body);
  // Solo se re-validan las referencias que realmente cambian
  const aValidar = {};
  ['genero', 'director', 'productora', 'tipo'].forEach((c) => {
    if (datos[c] !== undefined && String(datos[c]) !== String(media[c])) aValidar[c] = datos[c];
  });
  await validarReferencias(aValidar);

  media.set(datos);
  await media.save();
  await media.populate(POPULATE);
  res.json({ ok: true, mensaje: 'Producción actualizada correctamente', datos: media });
});

const eliminar = asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw httpError(404, 'Producción no encontrada');
  await media.deleteOne();
  res.json({ ok: true, mensaje: 'Producción eliminada correctamente' });
});

module.exports = { listar, obtener, obtenerPorSerial, crear, actualizar, eliminar };
