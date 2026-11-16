const { Schema, model } = require('mongoose');

const TipoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      unique: true,
    },
    descripcion: { type: String, trim: true, default: '' },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
  }
);

module.exports = model('Tipo', TipoSchema);
