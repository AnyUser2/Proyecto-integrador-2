# Diseño de la base de datos (MongoDB)

Base de datos: `peliculas_db` · Motor: MongoDB · ODM: Mongoose

## Diagrama entidad-relación

```mermaid
erDiagram
    GENERO     ||--o{ MEDIA : "clasifica (1 género por media)"
    DIRECTOR   ||--o{ MEDIA : "dirige (1 director principal)"
    PRODUCTORA ||--o{ MEDIA : "produce (1 productora principal)"
    TIPO       ||--o{ MEDIA : "tipifica (serie, película...)"

    GENERO {
        ObjectId _id PK
        String nombre UK
        String estado "Activo | Inactivo"
        String descripcion
        Date fechaCreacion
        Date fechaActualizacion
    }
    DIRECTOR {
        ObjectId _id PK
        String nombres
        String estado "Activo | Inactivo"
        Date fechaCreacion
        Date fechaActualizacion
    }
    PRODUCTORA {
        ObjectId _id PK
        String nombre UK
        String estado "Activo | Inactivo"
        String slogan
        String descripcion
        Date fechaCreacion
        Date fechaActualizacion
    }
    TIPO {
        ObjectId _id PK
        String nombre UK
        String descripcion
        Date fechaCreacion
        Date fechaActualizacion
    }
    MEDIA {
        ObjectId _id PK
        String serial UK
        String titulo
        String sinopsis
        String url UK
        String imagenPortada
        Number anioEstreno
        ObjectId genero FK
        ObjectId director FK
        ObjectId productora FK
        ObjectId tipo FK
        Date fechaCreacion
        Date fechaActualizacion
    }
```

## Colecciones

| Colección | Campos | Restricciones |
|-----------|--------|---------------|
| **generos** | nombre, estado, descripcion, fechaCreacion, fechaActualizacion | `nombre` único y requerido; `estado` ∈ {Activo, Inactivo} (por defecto Activo) |
| **directors** | nombres, estado, fechaCreacion, fechaActualizacion | `nombres` requerido; `estado` ∈ {Activo, Inactivo} |
| **productoras** | nombre, estado, slogan, descripcion, fechaCreacion, fechaActualizacion | `nombre` único y requerido; `estado` ∈ {Activo, Inactivo} |
| **tipos** | nombre, descripcion, fechaCreacion, fechaActualizacion | `nombre` único y requerido |
| **medias** | serial, titulo, sinopsis, url, imagenPortada, anioEstreno, genero, director, productora, tipo, fechaCreacion, fechaActualizacion | `serial` único; `url` única; referencias (ObjectId) a las 4 colecciones |

> Mongoose pluraliza automáticamente los nombres de colección (`Director` → `directors`).

## Reglas de negocio implementadas

1. Una producción pertenece a **un único** género, director, productora y tipo.
2. Al crear/editar una producción solo se aceptan **géneros, directores y productoras ACTIVOS**; el tipo solo debe existir.
3. `serial` y `url` son **únicos** en Media.
4. `fechaCreacion` y `fechaActualizacion` se gestionan automáticamente.
5. No se puede **eliminar** un género, director, productora o tipo que esté asociado a alguna producción (HTTP 409); se recomienda inactivarlo.
6. Datos iniciales (`npm run seed`): géneros acción, aventura, ciencia ficción, drama y terror; tipos película y serie.
