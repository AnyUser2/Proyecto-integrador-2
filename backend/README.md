
# API de películas y series

## Requisitos

- Node.js 18 o posterior y npm.
- MongoDB disponible en `mongodb://127.0.0.1:27017/peliculas_db`, o una URI configurada en `.env`.

## Preparar y ejecutar

Desde esta carpeta:

```bash
npm install
```

Con MongoDB encendido, crea los datos de prueba:

```bash
npm run seed
```

El seeder agrega o actualiza los registros de demostración sin borrar otros datos. Puedes volver a ejecutarlo sin duplicar esos registros.

Inicia la API:

```bash
npm run dev
```

El servidor queda en `http://localhost:3000`.
