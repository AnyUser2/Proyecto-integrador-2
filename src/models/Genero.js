const { Schema, model } = require('mongoose');

const GeneroSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      unique: true,
    },
    estado: {
      type: String,
      enum: { values: ['Activo', 'Inactivo'], message: 'El estado debe ser Activo o Inactivo' },
      default: 'Activo',
    },
    descripcion: { type: String, trim: true, default: '' },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
  }
);

module.exports = model('Genero', GeneroSchema);
