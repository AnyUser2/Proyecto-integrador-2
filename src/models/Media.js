const { Schema, model } = require('mongoose');

const MediaSchema = new Schema(
  {
    serial: {
      type: String,
      required: [true, 'El serial es obligatorio'],
      trim: true,
      unique: true,
    },
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
    },
    sinopsis: { type: String, trim: true, default: '' },
    url: {
      type: String,
      required: [true, 'La URL es obligatoria'],
      trim: true,
      unique: true,
    },
    imagenPortada: { type: String, trim: true, default: '' },
    anioEstreno: {
      type: Number,
      required: [true, 'El año de estreno es obligatorio'],
      min: [1888, 'El año de estreno no es válido'],
      max: [new Date().getFullYear() + 5, 'El año de estreno no es válido'],
    },
    genero: { type: Schema.Types.ObjectId, ref: 'Genero', required: [true, 'El género es obligatorio'] },
    director: { type: Schema.Types.ObjectId, ref: 'Director', required: [true, 'El director es obligatorio'] },
    productora: { type: Schema.Types.ObjectId, ref: 'Productora', required: [true, 'La productora es obligatoria'] },
    tipo: { type: Schema.Types.ObjectId, ref: 'Tipo', required: [true, 'El tipo es obligatorio'] },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
  }
);

module.exports = model('Media', MediaSchema);
