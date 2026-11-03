const { Schema, model } = require('mongoose');

const ProductoraSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la productora es obligatorio'],
      trim: true,
      unique: true,
    },
    estado: {
      type: String,
      enum: { values: ['Activo', 'Inactivo'], message: 'El estado debe ser Activo o Inactivo' },
      default: 'Activo',
    },
    slogan: { type: String, trim: true, default: '' },
    descripcion: { type: String, trim: true, default: '' },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
  }
);

module.exports = model('Productora', ProductoraSchema);
