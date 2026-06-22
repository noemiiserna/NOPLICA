const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const { parseSimpleAR, treeToCRT: projectionToCRT, treeToSQL: projectionToSQL } = require("./traductor/proyeccion");
const { parseSimpleSelectionAR, treeToCRT: selectionToCRT, treeToSQL: selectionToSQL } = require("./traductor/seleccion");
const { parseProjectionSelectionAR, treeToCRT: projectionSelectionToCRT, treeToSQL: projectionSelectionToSQL } = require("./traductor/proyeccionSeleccion");
const { crtToSQL } = require("./traductor/crt");

const {
  parseSetOperationAR,
  treeToCRT: setOperationToCRT,
  treeToSQL: setOperationToSQL
} = require("./traductor/operacionesRelacionales");


const {
  parseAggregationAR,
  treeToCRT: aggregationToCRT,
  treeToSQL: aggregationToSQL
} = require("./traductor/agrupacion");

const app = express();

app.use(express.json());
app.use(cors());

// Traduce los mensajes de errror de ingles a español.
function traducirErrorSQL(error) {
  const mensaje = error.message || "";

  if (mensaje.includes("You have an error in your SQL syntax")) {
    return "La consulta SQL contiene un error de sintaxis. Revisa la estructura de la consulta.";
  }

  if (mensaje.includes("doesn't exist")) {
    return "La consulta utiliza una tabla que no existe en la base de datos.";
  }

  if (mensaje.includes("Access denied")) {
    return "No se ha podido acceder a la base de datos. Revisa el usuario o la contraseña.";
  }

  if (mensaje.includes("Unknown database")) {
    return "La base de datos indicada no existe.";
  }

  if (mensaje.includes("ECONNREFUSED")) {
    return "No se ha podido conectar con el servidor MySQL. Revisa el host y el puerto.";
  }

  if (mensaje.includes("Unknown column")) {
  return "La consulta utiliza una columna que no existe en la base de datos.";
}

if (mensaje.includes("Table") && mensaje.includes("doesn't exist")) {
  return "La consulta utiliza una tabla que no existe en la base de datos.";
}

  return "Se ha producido un error al ejecutar la consulta.";
}

// Ejecuta una consulta SQL usando la conexión que manda el usuario desde React
async function executeSQL(sql, dbConfig) {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: Number(dbConfig.port),
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
  });

  const [rows] = await connection.query(sql); //Aqui es donde le pregunta a mysql , y es la que devuelve el resultado 

  await connection.end();

  return rows;
}

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

// Prueba si los datos de conexión son correctos
app.post("/api/db/test", async (req, res) => {
  try {
    const { host, port, user, password, database } = req.body;

    const connection = await mysql.createConnection({
      host,
      port: Number(port),
      user,
      password,
      database
    });

    await connection.query("SELECT 1");
    await connection.end();

    res.json({
      ok: true,
      message: "Conexión correcta con MySQL"
    });

  } catch (error) {
    res.status(400).json({
      ok: false,
      error: traducirErrorSQL(error)
    });
  }
});

// Traduce y ejecuta la consulta sobre la BD conectada
app.post("/traducir", async (req, res) => {
  try {
    const { query, dbConfig } = req.body;

    if (!query) {
      return res.status(400).json({
        error: "Debes enviar una consulta"
      });
    }

    if (!dbConfig) {
      return res.status(400).json({
        error: "Primero debes conectar una base de datos"
      });
    }

    let tree;
    let crt;
    let sql;

    const cleanQuery = query.trim();

    if (cleanQuery.startsWith("π") && cleanQuery.includes("σ")) {
      tree = parseProjectionSelectionAR(cleanQuery);
      crt = projectionSelectionToCRT(tree);
      sql = projectionSelectionToSQL(tree);
    }

    else if (cleanQuery.startsWith("π") && cleanQuery.includes("NOT EXISTS")) {
      tree = parseProjectionSelectionAR(cleanQuery);
      crt = projectionSelectionToCRT(tree);
      sql = projectionSelectionToSQL(tree);
    }
    
    else if (cleanQuery.startsWith("π")) {
      tree = parseSimpleAR(cleanQuery);
      crt = projectionToCRT(tree);
      sql = projectionToSQL(tree);
    }

    else if (cleanQuery.startsWith("σ")) {
      tree = parseSimpleSelectionAR(cleanQuery);
      crt = selectionToCRT(tree);
      sql = selectionToSQL(tree);
    }

    else if (cleanQuery.startsWith("{")) {
      sql = crtToSQL(cleanQuery);
    }
    else if (cleanQuery.startsWith("γ")) {
          tree = parseAggregationAR(cleanQuery);
          crt = aggregationToCRT(tree);
          sql = aggregationToSQL(tree);
    }

    else if (
      cleanQuery.includes("∪") ||
      cleanQuery.includes("∩") ||
      cleanQuery.includes("×") ||
      cleanQuery.includes("-")
    ) {
      tree = parseSetOperationAR(cleanQuery);
      crt = setOperationToCRT(tree);
      sql = setOperationToSQL(tree);
    }

    else {
      throw new Error("Consulta no soportada");
    }

   const outputType = req.body.outputType || "all";

if (outputType === "crt") {
  return res.json({
    entrada: query,
    database: dbConfig.database,
    arbol: tree,
    crt
  });
}

if (outputType === "sql") {
  return res.json({
    entrada: query,
    database: dbConfig.database,
    arbol: tree,
    sql
  });
}

const mysqlResult = await executeSQL(sql, dbConfig);

res.json({
  entrada: query,
  database: dbConfig.database,
  arbol: tree,
  crt,
  sql,
  resultado: mysqlResult
});

  } catch (error) {
    res.status(400).json({
      error: traducirErrorSQL(error)
    });
  }
});

app.post("/execute-sql", async (req, res) => {
  try {
    const { sql, dbConfig } = req.body;

    if (!sql) {
      return res.status(400).json({
        error: "Debes enviar una consulta SQL"
      });
    }

    if (!dbConfig) {
      return res.status(400).json({
        error: "Primero debes conectar una base de datos"
      });
    }

    const mysqlResult = await executeSQL(sql, dbConfig);

    res.json({
      database: dbConfig.database,
      sql,
      resultado: mysqlResult
    });

  } catch (error) {
    res.status(400).json({
      error: traducirErrorSQL(error)
    });
  }
});

app.listen(5000, () => {
  console.log("Servidor en http://localhost:5000");
});