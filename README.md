# Catálogo de películas y series

Aplicación para administrar géneros, directores, productoras, tipos y producciones audiovisuales. El repositorio está organizado en dos proyectos independientes:

- `backend/`: API REST existente con Node.js, Express y MongoDB.
- `frontend/`: interfaz web con React y Vite.

## Requisitos

- Node.js 18 o posterior y npm.
- MongoDB local en `mongodb://127.0.0.1:27017/peliculas_db`, o una URI propia configurada en `backend/.env`.

## Iniciar el backend

Desde una terminal:

```bash
cd backend
npm install
npm run seed
npm run dev
```

`npm run seed` crea los datos de prueba iniciales (géneros, directores, productoras, tipos y producciones enlazadas). Es seguro ejecutarlo nuevamente y no elimina otros datos. La API estará disponible en `http://localhost:3000`. Asegúrate de que MongoDB esté iniciado antes de sembrar los datos o ejecutar el backend.

## Iniciar el frontend

Abre otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente **http://localhost:5173**. El frontend consume la API en `http://localhost:3000/api`; puedes cambiar la dirección copiando `frontend/.env.example` a `frontend/.env` y ajustando `VITE_API_URL`.

## Módulos

La interfaz permite consultar, buscar, crear, editar y eliminar registros de los cinco módulos. Media permite seleccionar los catálogos relacionados, filtrar por tipo y abrir los enlaces de cada producción. Los errores y restricciones de la API, como intentar borrar un catálogo que está en uso, se muestran en pantalla.
