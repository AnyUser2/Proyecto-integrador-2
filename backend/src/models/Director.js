const { Schema, model } = require('mongoose');

const DirectorSchema = new Schema(
  {
    nombres: {
      type: String,
      required: [true, 'Los nombres son obligatorios'],
      trim: true,
    },
    estado: {
      type: String,
      enum: { values: ['Activo', 'Inactivo'], message: 'El estado debe ser Activo o Inactivo' },
      default: 'Activo',
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
  }
);

module.exports = model('Director', DirectorSchema);
