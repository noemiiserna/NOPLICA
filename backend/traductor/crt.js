function formatCRTConditionToSQL(condition) {
  return condition
    .replace(/t\./g, "")
    .replace(/∧/g, "AND")
    .replace(/∨/g, "OR")
    .replace(/¬/g, "NOT")
    .trim();
}

function crtToSQL(query) {
  const cleanQuery = query.trim();

  // Caso 1
  const simpleMatch = cleanQuery.match(
    /^\{\s*(t\.[\wÁÉÍÓÚáéíóúÑñ_]+(?:\s*,\s*t\.[\wÁÉÍÓÚáéíóúÑñ_]+)*)\s*\|\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\(t\)\s*\}$/
  );

  if (simpleMatch) {
    const attributes = simpleMatch[1]
      .split(",")
      .map(attr => attr.trim().replace("t.", ""));

    const table = simpleMatch[2];

    return `SELECT DISTINCT ${attributes.join(", ")} FROM ${table};`;
  }
// Caso 2: EXISTS
const existsMatch = cleanQuery.match(
  /^\{\s*(t\.[\wÁÉÍÓÚáéíóúÑñ_]+(?:\s*,\s*t\.[\wÁÉÍÓÚáéíóúÑñ_]+)*)\s*\|\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\(t\)\s*∧\s*∃e\s*\(([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\(e\)\s*∧\s*e\.([\wÁÉÍÓÚáéíóúÑñ_]+)\s*=\s*t\.([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\)\s*\}$/
);

if (existsMatch) {
  const attributes = existsMatch[1]
    .split(",")
    .map(attr => attr.trim().replace("t.", "C."));

  const mainTable = existsMatch[2];
  const subTable = existsMatch[3];
  const subField = existsMatch[4];
  const mainField = existsMatch[5];

  return `SELECT DISTINCT ${attributes.join(", ")} FROM ${mainTable} C WHERE EXISTS (SELECT * FROM ${subTable} E WHERE E.${subField} = C.${mainField});`;
}

  // Caso 3: NOT EXITS
  const notExistsMatch = cleanQuery.match(
    /^\{\s*(t\.[\wÁÉÍÓÚáéíóúÑñ_]+(?:\s*,\s*t\.[\wÁÉÍÓÚáéíóúÑñ_]+)*)\s*\|\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\(t\)\s*∧\s*¬∃e\s*\(([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\(e\)\s*∧\s*e\.([\wÁÉÍÓÚáéíóúÑñ_]+)\s*=\s*t\.([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\)\s*\}$/
  );

  if (notExistsMatch) {
    const attributes = notExistsMatch[1]
      .split(",")
      .map(attr => attr.trim().replace("t.", "C."));

    const mainTable = notExistsMatch[2];
    const subTable = notExistsMatch[3];
    const subField = notExistsMatch[4];
    const mainField = notExistsMatch[5];

    return `SELECT ${attributes.join(", ")} FROM ${mainTable} C WHERE NOT EXISTS (SELECT * FROM ${subTable} E WHERE E.${subField} = C.${mainField});`;
  }

  // Caso 4: Consulta con dos tablas y condición de unión.

const joinSelectionMatch = cleanQuery.match(
  /^\{\s*([\wÁÉÍÓÚáéíóúÑñ_.]+(?:\s*,\s*[\wÁÉÍÓÚáéíóúÑñ_.]+)*)\s*\|\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\(([\wÁÉÍÓÚáéíóúÑñ_]+)\)\s*∧\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\(([\wÁÉÍÓÚáéíóúÑñ_]+)\)\s*∧\s*(.+)\s*\}$/
);

if (joinSelectionMatch) {
  const attributes = joinSelectionMatch[1]
    .split(",")
    .map(attr => attr.trim());

  const leftTable = joinSelectionMatch[2];
  const leftAlias = joinSelectionMatch[3];

  const rightTable = joinSelectionMatch[4];
  const rightAlias = joinSelectionMatch[5];

  const condition = joinSelectionMatch[6];

  const sqlCondition = condition
    .replace(/∧/g, "AND")
    .replace(/∨/g, "OR")
    .replace(/¬/g, "NOT")
    .trim();

  return `SELECT DISTINCT ${attributes.join(", ")} FROM ${leftTable} ${leftAlias}, ${rightTable} ${rightAlias} WHERE ${sqlCondition};`;
}

  // Caso 5:
  const selectionMatch = cleanQuery.match(
    /^\{\s*(t\.[\wÁÉÍÓÚáéíóúÑñ_]+(?:\s*,\s*t\.[\wÁÉÍÓÚáéíóúÑñ_]+)*)\s*\|\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\(t\)\s*∧\s*(.+)\s*\}$/
  );

  if (selectionMatch) {
    const attributes = selectionMatch[1]
      .split(",")
      .map(attr => attr.trim().replace("t.", ""));

    const table = selectionMatch[2];
    const condition = selectionMatch[3];

    const sqlCondition = formatCRTConditionToSQL(condition);

    return `SELECT DISTINCT ${attributes.join(", ")} FROM ${table} WHERE ${sqlCondition};`;
  }

  // Caso 6:
  const tupleSelectionMatch = cleanQuery.match(
    /^\{\s*t\s*\|\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\(t\)\s*∧\s*(.+)\s*\}$/
  );

  if (tupleSelectionMatch) {
    const table = tupleSelectionMatch[1];
    const condition = tupleSelectionMatch[2];

    const sqlCondition = formatCRTConditionToSQL(condition);

    return `SELECT * FROM ${table} WHERE ${sqlCondition};`;
  }

  // Caso 7:
  const setOperationMatch = cleanQuery.match(
    /^\{\s*t\s*\|\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\(t\)\s*(∨|∧)\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\(t\)\s*\}$/
  );

  if (setOperationMatch) {
    const leftTable = setOperationMatch[1];
    const operator = setOperationMatch[2];
    const rightTable = setOperationMatch[3];

    if (operator === "∨") {
      return `SELECT * FROM ${leftTable} UNION SELECT * FROM ${rightTable};`;
    }

    if (operator === "∧") {
      return `SELECT * FROM ${leftTable} INTERSECT SELECT * FROM ${rightTable};`;
    }
  }

  // Caso 7:
  const cartesianMatch = cleanQuery.match(
    /^\{\s*t\s*,\s*u\s*\|\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\(t\)\s*∧\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s*\(u\)\s*\}$/
  );

  if (cartesianMatch) {
    const leftTable = cartesianMatch[1];
    const rightTable = cartesianMatch[2];

    return `SELECT * FROM ${leftTable}, ${rightTable};`;
  }


  throw new Error("Formato CRT no válido");
}

module.exports = {
  crtToSQL
};
