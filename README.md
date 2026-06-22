# NOPLICA

## Descripción

NOPLICA es una aplicación web desarrollada como Trabajo Fin de Grado en Ingeniería Informática orientada al aprendizaje de los lenguajes del modelo relacional de datos.

La aplicación permite:

- Traducir consultas de Álgebra Relacional (AR) a Cálculo Relacional de Tuplas (CRT) y SQL.
- Traducir consultas de Cálculo Relacional de Tuplas (CRt) a SQL.
- Ejecutar consultas SQL sobre una base de datos MySQL.
- Visualizar el resultado obtenido de forma inmediata.


## Tecnologías utilizadas

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express
- mysql2

### Despliegue

- Docker
- Docker Compose


## Requisitos

Es necesario disponer de:

- Docker Desktop
- MySQL 8.x

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/USUARIO/NOPLICA.git
cd NOPLICA
```

---

## Ejecución

Con Docker Desktop iniciado, ejecutar:

```bash
docker-compose up --build
```

La aplicación estará disponible en:

```
Frontend:
http://localhost:5173

Backend:
http://localhost:5000
```

---

## Base de datos de prueba

En la carpeta:

```
database/
```

se proporciona la base de datos **ciclismo.sql** utilizada durante el desarrollo del proyecto.

Importarla previamente en MySQL.

---

## Conexión a la base de datos

Una vez iniciada la aplicación, pulsar el botón **Conectar BD** e introducir los datos de conexión.

Ejemplo:

```
Host:
host.docker.internal

Puerto:
3306

Usuario:
root

Contraseña:
********

Base de datos:
ciclismo
```

---

## Funcionalidades implementadas

La aplicación soporta:

### Álgebra Relacional

- Proyección (π)
- Selección (σ)
- Proyección + Selección
- Unión (∪)
- Intersección (∩)
- Producto cartesiano (×)
- Agrupación (γ)
- Funciones de agregación:
  - COUNT
  - MIN
  - MAX
  - AVG
  - SUM
- Consultas sobre dos tablas
- EXISTS
- NOT EXISTS

### Cálculo Relacional de Tuplas

- Traducción a SQL
- Operadores lógicos
- Consultas sobre una o dos relaciones
- EXISTS
- NOT EXISTS

### SQL

- Ejecución directa sobre MySQL
- Visualización de resultados

---

## Ejemplos de consultas

### Álgebra Relacional

```text
π nombre (σ edad >= 25 (ciclista))
```

```text
π nombre, director (σ ciclista.nomeq = equipo.nomeq (ciclista × equipo))
```

```text
γ nomeq ; COUNT(*) → num_ciclistas (ciclista)
```

```text
π nombre (NOT EXISTS etapa (ciclista))
```

---

### Cálculo Relacional

```text
{ t.nombre | ciclista(t) ∧ t.edad >= 25 }
```

```text
{ nombre, director | ciclista(ciclista) ∧ equipo(equipo) ∧ ciclista.nomeq = equipo.nomeq }
```

---

### SQL

```sql
SELECT nombre
FROM ciclista
WHERE edad >= 25;
```

---

## Notas

Las consultas SQL son procesadas directamente por MySQL, por lo que la aplicación puede ejecutar cualquier consulta SQL válida soportada por dicho SGBD.

En el caso del Álgebra Relacional y del Cálculo Relacional de Tuplas, la aplicación implementa un traductor propio basado en un conjunto de operadores y patrones representativos, suficientes para cubrir los casos de uso contemplados en el proyecto.

---

## Autora

Noemí Serna Martín

Trabajo Fin de Grado

Grado en Ingeniería Informática

Universidad de Zaragoza
