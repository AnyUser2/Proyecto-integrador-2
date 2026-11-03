const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    ok: true,
    api: 'API Películas y Series - IU Digital de Antioquia',
    endpoints: ['/api/generos', '/api/directores', '/api/productoras', '/api/tipos', '/api/media'],
  });
});

app.use('/api/generos', require('./routes/genero.routes'));
app.use('/api/directores', require('./routes/director.routes'));
app.use('/api/productoras', require('./routes/productora.routes'));
app.use('/api/tipos', require('./routes/tipo.routes'));
app.use('/api/media', require('./routes/media.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
