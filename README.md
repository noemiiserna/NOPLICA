# NOPLICA

## Descripción

NOPLICA es una aplicación web desarrollada como Trabajo Fin de Grado en Ingeniería Informática orientada al aprendizaje de los lenguajes del modelo relacional de datos.

La aplicación permite:

- Traducir consultas de Álgebra Relacional (AR) a Cálculo Relacional de Tuplas (CRT) y SQL.
- Traducir consultas de Cálculo Relacional de Tuplas (CRT) a SQL.
- Ejecutar consultas SQL sobre una base de datos MySQL.
- Visualizar de forma inmediata tanto la traducción como el resultado de la consulta.

---

# Tecnologías utilizadas

## Frontend

- React
- Vite
- JavaScript
- CSS

## Backend

- Node.js
- Express
- mysql2

## Despliegue

- Docker
- Docker Compose

---

# Requisitos

Para ejecutar la aplicación es necesario disponer de:

- Docker Desktop
- MySQL 8.x

---

# Instalación

Clonar el repositorio:

```bash
git clone https://github.com/noemiiserna/NOPLICA.git
cd NOPLICA
```

---

# Ejecución

## 1. Iniciar Docker Desktop

Es imprescindible que Docker Desktop esté abierto y en ejecución antes de iniciar la aplicación.

## 2. Levantar los contenedores

Desde la carpeta raíz del proyecto ejecutar:

```bash
docker-compose up --build
```

La primera ejecución puede tardar unos minutos mientras Docker descarga las dependencias necesarias.

Una vez finalizada, aparecerán mensajes similares a:

```
Servidor en http://localhost:5000

VITE ready

http://localhost:5173
```

## 3. Abrir la aplicación

Acceder desde el navegador a:

```
Frontend
http://localhost:5173

Backend
http://localhost:5000
```

---

# Base de datos de prueba

En la carpeta:

```
BD/
```

se proporciona la base de datos **ciclismo.sql** utilizada durante el desarrollo del proyecto.

Debe importarse previamente en MySQL antes de utilizar la aplicación.

---

# Conexión a la base de datos

Una vez iniciada la aplicación:

1. Pulsar el botón **Conectar BD**.
2. Introducir los datos de conexión correspondientes a la base de datos.

Ejemplo de configuración:

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

# Funcionalidades implementadas

## Álgebra Relacional

La aplicación soporta:

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

## Cálculo Relacional de Tuplas

La aplicación soporta:

- Traducción a SQL
- Operadores lógicos
- Consultas sobre una relación
- Consultas sobre dos relaciones
- EXISTS
- NOT EXISTS

## SQL

- Ejecución directa sobre MySQL.
- Visualización de resultados.

---

# Ejemplos de consultas

## Álgebra Relacional

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

## Cálculo Relacional de Tuplas

```text
{ t.nombre | ciclista(t) ∧ t.edad >= 25 }
```

```text
{ nombre, director | ciclista(ciclista) ∧ equipo(equipo) ∧ ciclista.nomeq = equipo.nomeq }
```

## SQL

```sql
SELECT distinct e.nomeq, e.director
FROM equipo e, ciclista c
WHERE e.nomeq = c.nomeq
GROUP BY e.nomeq, e.director
HAVING AVG (EDAD) <= ALL (select avg(edad)
FROM equipo e, ciclista c   WHERE e.nomeq = c.nomeq   GROUP BY e.nomeq)


```

---

# Notas

- La aplicación utiliza una arquitectura cliente-servidor desplegada mediante Docker.
- Es imprescindible que Docker Desktop permanezca abierto mientras se utiliza la aplicación.
- Las consultas SQL son enviadas directamente al sistema gestor de bases de datos MySQL, que es el encargado de validarlas y ejecutarlas.
- Las traducciones de Álgebra Relacional y Cálculo Relacional de Tuplas son realizadas por un traductor propio implementado específicamente para este proyecto y soportan un conjunto representativo de operadores y patrones orientados a un contexto docente.

---

# Autora

**Noemí Serna Martín**

Trabajo Fin de Grado

Grado en Ingeniería Informática

Escuela Universitaria Politécnica de Teruel

Universidad de Zaragoza
