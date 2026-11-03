const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/peliculas_db';
  try {
    await mongoose.connect(uri);
    console.log(`Conectado a MongoDB: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
