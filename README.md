# API REST - Películas y Series
**Ingeniería Web II · Institución Universitaria Digital de Antioquia**

API REST construida con **Node.js + Express + MongoDB (Mongoose)** para gestionar los módulos:
**Género, Director, Productora, Tipo y Media (películas y series)**.

## Requisitos
- Node.js 18 o superior
- MongoDB local (`mongodb://127.0.0.1:27017`) o una cuenta en MongoDB Atlas

## Instalación y ejecución

```bash
npm install
cp .env.example .env      # ya incluido; edite MONGODB_URI si usa Atlas
npm run seed              # (opcional) carga géneros y tipos iniciales
npm run dev               # modo desarrollo (nodemon)  |  npm start
```

El servidor queda en `http://localhost:3000`.

## Estructura

```
src/
├── config/db.js              # Conexión a MongoDB
├── models/                   # Esquemas Mongoose (Genero, Director, Productora, Tipo, Media)
├── controllers/              # Lógica de negocio (crud.factory + media.controller)
├── routes/                   # Definición de endpoints
├── middlewares/              # Validación de ids y manejo de errores
├── seed/seed.js              # Datos iniciales
├── app.js                    # Configuración de Express
└── server.js                 # Arranque
docs/
├── diseno-base-de-datos.md   # Modelo ER y reglas de negocio
└── Peliculas-API.postman_collection.json
```

## Endpoints

Todos los módulos exponen el mismo CRUD:

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/{recurso}` | Listar (admite `?estado=Activo` en género, director y productora) |
| GET | `/api/{recurso}/:id` | Consultar por id |
| POST | `/api/{recurso}` | Crear |
| PUT | `/api/{recurso}/:id` | Actualizar (actualiza `fechaActualizacion`) |
| DELETE | `/api/{recurso}/:id` | Eliminar |

Recursos: `generos`, `directores`, `productoras`, `tipos`, `media`.

Extras de **Media**:
- `GET /api/media/serial/:serial` – consultar por serial.
- `GET /api/media?genero=&director=&productora=&tipo=&anioEstreno=&q=` – filtros y búsqueda por título.

### Cuerpos de ejemplo

**Género** `POST /api/generos`
```json
{ "nombre": "Comedia", "estado": "Activo", "descripcion": "Producciones humorísticas" }
```

**Director** `POST /api/directores`
```json
{ "nombres": "Christopher Nolan", "estado": "Activo" }
```

**Productora** `POST /api/productoras`
```json
{ "nombre": "Warner Bros", "estado": "Activo", "slogan": "Entertainment", "descripcion": "Estudio de cine" }
```

**Tipo** `POST /api/tipos`
```json
{ "nombre": "Documental", "descripcion": "Producciones basadas en hechos reales" }
```

**Media** `POST /api/media`
```json
{
  "serial": "PEL-0001",
  "titulo": "Oppenheimer",
  "sinopsis": "La historia del físico J. Robert Oppenheimer.",
  "url": "https://ejemplo.com/peliculas/oppenheimer",
  "imagenPortada": "https://ejemplo.com/portadas/oppenheimer.jpg",
  "anioEstreno": 2023,
  "genero": "<id_genero_activo>",
  "director": "<id_director_activo>",
  "productora": "<id_productora_activa>",
  "tipo": "<id_tipo>"
}
```

## Códigos de respuesta

| Código | Significado |
|--------|-------------|
| 200 / 201 | Operación exitosa / recurso creado |
| 400 | Validación fallida, id inválido o referencia inexistente/inactiva |
| 404 | Recurso o ruta no encontrada |
| 409 | Valor duplicado (nombre, serial, url) o recurso en uso al eliminar |
| 500 | Error interno |

## Reglas de negocio
- Media solo acepta **género, director y productora activos**, y un **tipo existente**.
- `serial` y `url` de Media son **únicos**.
- No se elimina un género/director/productora/tipo asociado a producciones (409).
- Sin autenticación (por ahora, según el caso de estudio).

## Pruebas
Importe `docs/Peliculas-API.postman_collection.json` en Postman (variable `baseUrl` = `http://localhost:3000`).
Orden sugerido: crear género → director → productora → tipo → media.
