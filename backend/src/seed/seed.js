const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Director = require('../models/Director');
const Genero = require('../models/Genero');
const Media = require('../models/Media');
const Productora = require('../models/Productora');
const Tipo = require('../models/Tipo');

const generos = [
  { nombre: 'Acción', estado: 'Activo', descripcion: 'Historias de aventura, riesgo y acción.' },
  { nombre: 'Aventura', estado: 'Activo', descripcion: 'Viajes, descubrimientos y exploración.' },
  { nombre: 'Ciencia ficción', estado: 'Activo', descripcion: 'Mundos y tecnologías imaginarias.' },
  { nombre: 'Comedia', estado: 'Activo', descripcion: 'Historias ligeras y humorísticas.' },
  { nombre: 'Drama', estado: 'Activo', descripcion: 'Relatos centrados en conflictos personales.' },
  { nombre: 'Suspenso', estado: 'Activo', descripcion: 'Historias de misterio y tensión.' },
];

const directores = [
  { nombres: 'Valeria Montes', estado: 'Activo' },
  { nombres: 'Tomás Beltrán', estado: 'Activo' },
  { nombres: 'Camila Robles', estado: 'Activo' },
  { nombres: 'Andrés Navarro', estado: 'Activo' },
  { nombres: 'Marina Solís', estado: 'Activo' },
];

const productoras = [
  { nombre: 'Luz Norte Studio', estado: 'Activo', slogan: 'Historias que iluminan.', descripcion: 'Estudio independiente de ficción.' },
  { nombre: 'Brújula Films', estado: 'Activo', slogan: 'Siempre hay otro camino.', descripcion: 'Productora de aventuras y drama.' },
  { nombre: 'Nube Roja Producciones', estado: 'Activo', slogan: 'Imagina sin límites.', descripcion: 'Contenido de ciencia ficción y fantasía.' },
  { nombre: 'Ventana Sur Media', estado: 'Activo', slogan: 'Relatos para compartir.', descripcion: 'Series, documentales y comedia.' },
];

const tipos = [
  { nombre: 'Película', descripcion: 'Producción audiovisual de formato cinematográfico.' },
  { nombre: 'Serie', descripcion: 'Producción narrativa organizada en episodios.' },
  { nombre: 'Documental', descripcion: 'Producción basada en hechos o temas reales.' },
];

const media = [
  {
    serial: 'DEMO-0001',
    titulo: 'El último horizonte',
    sinopsis: 'Una piloto emprende un viaje para encontrar un nuevo hogar.',
    url: 'https://example.com/media/DEMO-0001',
    anioEstreno: 2024,
    genero: 'Ciencia ficción',
    director: 'Valeria Montes',
    productora: 'Nube Roja Producciones',
    tipo: 'Película',
  },
  {
    serial: 'DEMO-0002',
    titulo: 'La estación de los días',
    sinopsis: 'Dos desconocidos se encuentran cada semana en una pequeña estación.',
    url: 'https://example.com/media/DEMO-0002',
    anioEstreno: 2022,
    genero: 'Drama',
    director: 'Tomás Beltrán',
    productora: 'Luz Norte Studio',
    tipo: 'Película',
  },
  {
    serial: 'DEMO-0003',
    titulo: 'Ciudad de papel',
    sinopsis: 'Un equipo de vecinos resuelve los misterios de su barrio.',
    url: 'https://example.com/media/DEMO-0003',
    anioEstreno: 2023,
    genero: 'Aventura',
    director: 'Camila Robles',
    productora: 'Brújula Films',
    tipo: 'Serie',
  },
  {
    serial: 'DEMO-0004',
    titulo: 'Cocina de barrio',
    sinopsis: 'Una cocinera reúne a la comunidad alrededor de su nuevo restaurante.',
    url: 'https://example.com/media/DEMO-0004',
    anioEstreno: 2021,
    genero: 'Comedia',
    director: 'Andrés Navarro',
    productora: 'Ventana Sur Media',
    tipo: 'Serie',
  },
  {
    serial: 'DEMO-0005',
    titulo: 'Rutas invisibles',
    sinopsis: 'Un recorrido por los caminos que conectan comunidades rurales.',
    url: 'https://example.com/media/DEMO-0005',
    anioEstreno: 2025,
    genero: 'Aventura',
    director: 'Marina Solís',
    productora: 'Ventana Sur Media',
    tipo: 'Documental',
  },
  {
    serial: 'DEMO-0006',
    titulo: 'El eco del bosque',
    sinopsis: 'Una guardabosques investiga una serie de señales inesperadas.',
    url: 'https://example.com/media/DEMO-0006',
    anioEstreno: 2020,
    genero: 'Suspenso',
    director: 'Valeria Montes',
    productora: 'Brújula Films',
    tipo: 'Película',
  },
  {
    serial: 'DEMO-0007',
    titulo: 'Pequeños gigantes',
    sinopsis: 'Un grupo de estudiantes transforma un problema en una gran aventura.',
    url: 'https://example.com/media/DEMO-0007',
    anioEstreno: 2024,
    genero: 'Comedia',
    director: 'Camila Robles',
    productora: 'Luz Norte Studio',
    tipo: 'Serie',
  },
  {
    serial: 'DEMO-0008',
    titulo: 'Voces del agua',
    sinopsis: 'Habitantes de distintas regiones cuentan su relación con los ríos.',
    url: 'https://example.com/media/DEMO-0008',
    anioEstreno: 2023,
    genero: 'Drama',
    director: 'Marina Solís',
    productora: 'Ventana Sur Media',
    tipo: 'Documental',
  },
];

const upsertMany = async (Model, key, records) => {
  const saved = [];
  for (const record of records) {
    const item = await Model.findOneAndUpdate(
      { [key]: record[key] },
      { $set: record },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    saved.push(item);
  }
  return saved;
};

const makeIdMap = (records, field) =>
  Object.fromEntries(records.map((record) => [record[field], record._id]));

const findReference = (references, name, label) => {
  const id = references[name];
  if (!id) throw new Error(`No se encontró ${label}: ${name}`);
  return id;
};

const runSeed = async () => {
  await connectDB();

  try {
    const savedGeneros = await upsertMany(Genero, 'nombre', generos);
    const savedDirectores = await upsertMany(Director, 'nombres', directores);
    const savedProductoras = await upsertMany(Productora, 'nombre', productoras);
    const savedTipos = await upsertMany(Tipo, 'nombre', tipos);

    const generoIds = makeIdMap(savedGeneros, 'nombre');
    const directorIds = makeIdMap(savedDirectores, 'nombres');
    const productoraIds = makeIdMap(savedProductoras, 'nombre');
    const tipoIds = makeIdMap(savedTipos, 'nombre');

    const mediaConReferencias = media.map((record) => ({
      ...record,
      genero: findReference(generoIds, record.genero, 'género'),
      director: findReference(directorIds, record.director, 'director'),
      productora: findReference(productoraIds, record.productora, 'productora'),
      tipo: findReference(tipoIds, record.tipo, 'tipo'),
    }));

    await upsertMany(Media, 'serial', mediaConReferencias);
    console.log('Datos de prueba listos: 6 géneros, 5 directores, 4 productoras, 3 tipos y 8 producciones.');
  } finally {
    await mongoose.connection.close();
  }
};

runSeed().catch((error) => {
  console.error('No se pudieron crear los datos de prueba:', error.message);
  process.exitCode = 1;
});
