/*
 * Traducción de consultas con proyección y selección.
 *
 * Caso 0: proyección + selección con agregación MIN/MAX.
 * Caso NOT EXISTS: ciclistas que no han ganado etapas.
 * Caso 1: proyección + selección sobre una tabla.
 * Caso 2: proyección + selección sobre producto cartesiano de dos tablas.
 */

function parseProjectionSelectionAR(query) {
  // Caso 0: π atributos (σ campo = alias (tabla × γ ; MIN(campo) → alias (tabla)))
  const matchMinAggregation = query.match(
    /^π\s+([\wÁÉÍÓÚáéíóúÑñ_\s,]+)\s+\(σ\s+([\wÁÉÍÓÚáéíóúÑñ_]+)\s*=\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s+\(([\wÁÉÍÓÚáéíóúÑñ_]+)\s*×\s*γ\s*;\s*(MIN|MAX)\(([\wÁÉÍÓÚáéíóúÑñ_]+)\)\s*→\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s+\(([\wÁÉÍÓÚáéíóúÑñ_]+)\)\)\)$/
  );

  if (matchMinAggregation) {
    const attributes = matchMinAggregation[1]
      .split(",")
      .map(attr => attr.trim());

    return {
      type: "projectionAggregationSelection",
      attributes,
      field: matchMinAggregation[2],
      alias: matchMinAggregation[3],
      table: matchMinAggregation[4],
      functionName: matchMinAggregation[5],
      aggregateField: matchMinAggregation[6],
      aggregateAlias: matchMinAggregation[7],
      aggregateTable: matchMinAggregation[8]
    };
  }

  // Caso NOT EXISTS:
  // π nombre (NOT EXISTS etapa (ciclista))
  const matchNotExists = query.match(
    /^π\s+([\wÁÉÍÓÚáéíóúÑñ_\s,]+)\s+\(NOT EXISTS\s+([\wÁÉÍÓÚáéíóúÑñ_]+)\s+\(([\wÁÉÍÓÚáéíóúÑñ_]+)\)\)$/
  );

  if (matchNotExists) {
    const attributes = matchNotExists[1]
      .split(",")
      .map(attr => attr.trim());

    return {
      type: "projectionNotExists",
      attributes,
      mainTable: matchNotExists[3],
      subTable: matchNotExists[2],
      joinField: "dorsal"
    };
  }

  // Caso 1: π atributos (σ condicion (tabla))
  const matchOneTable = query.match(
    /^π\s+([\wÁÉÍÓÚáéíóúÑñ_\s,]+)\s+\(σ\s+(.+)\s+\(([\wÁÉÍÓÚáéíóúÑñ_]+)\)\)$/
  );

  if (matchOneTable) {
    const attributes = matchOneTable[1]
      .split(",")
      .map(attr => attr.trim());

    return {
      type: "projection",
      attributes,
      relation: {
        type: "selection",
        condition: matchOneTable[2],
        relation: {
          type: "table",
          name: matchOneTable[3]
        }
      }
    };
  }

  // Caso 2: π atributos (σ condicion (tabla1 × tabla2))
  const matchTwoTables = query.match(
    /^π\s+([\wÁÉÍÓÚáéíóúÑñ_\s,]+)\s+\(σ\s+(.+)\s+\(([\wÁÉÍÓÚáéíóúÑñ_]+)\s*×\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\)\)$/
  );

  if (matchTwoTables) {
    const attributes = matchTwoTables[1]
      .split(",")
      .map(attr => attr.trim());

    return {
      type: "projection",
      attributes,
      relation: {
        type: "selection",
        condition: matchTwoTables[2],
        relation: {
          type: "cartesian",
          left: {
            type: "table",
            name: matchTwoTables[3]
          },
          right: {
            type: "table",
            name: matchTwoTables[4]
          }
        }
      }
    };
  }

  throw new Error("Formato no válido");
}

function formatConditionForCRT(condition, mode = "oneTable") {
  let crtCondition = condition;

  if (mode === "twoTables") {
    crtCondition = crtCondition.replace(
      /\b([\wÁÉÍÓÚáéíóúÑñ_]+)\.([\wÁÉÍÓÚáéíóúÑñ_]+)\b/g,
      "$1.$2"
    );
  } else {
    crtCondition = crtCondition.replace(
      /\b([\wÁÉÍÓÚáéíóúÑñ_]+)\s*(>=|<=|=|>|<)\s*/g,
      "t.$1 $2 "
    );
  }

  return crtCondition
    .replace(/∧/g, " ∧ ")
    .replace(/∨/g, " ∨ ")
    .replace(/¬/g, "¬")
    .replace(/\s+/g, " ")
    .trim();
}

function formatConditionForSQL(condition) {
  return condition
    .replace(/∧/g, " AND ")
    .replace(/∨/g, " OR ")
    .replace(/¬/g, "NOT ")
    .replace(/\s+/g, " ")
    .trim();
}

function treeToCRT(tree) {
  if (tree.type === "projectionAggregationSelection") {
    return "Consulta con agregación anidada. No existe una traducción directa estándar a CR básico.";
  }

  if (tree.type === "projectionNotExists") {
    const attrs = tree.attributes.map(attr => `t.${attr}`).join(", ");

    return `{ ${attrs} | ${tree.mainTable}(t) ∧ ¬∃e (${tree.subTable}(e) ∧ e.${tree.joinField} = t.${tree.joinField}) }`;
  }

  const relation = tree.relation.relation;
  const condition = tree.relation.condition;

  if (relation.type === "cartesian") {
    const table1 = relation.left.name;
    const table2 = relation.right.name;

    const attrs = tree.attributes.join(", ");
    const crtCondition = formatConditionForCRT(condition, "twoTables");

    return `{ ${attrs} | ${table1}(${table1}) ∧ ${table2}(${table2}) ∧ ${crtCondition} }`;
  }

  const attrs = tree.attributes.map(attr => `t.${attr}`).join(", ");
  const tableName = relation.name;
  const crtCondition = formatConditionForCRT(condition, "oneTable");

  return `{ ${attrs} | ${tableName}(t) ∧ ${crtCondition} }`;
}

function treeToSQL(tree) {
  if (tree.type === "projectionAggregationSelection") {
    const attrs = tree.attributes.join(", ");

    return `SELECT DISTINCT ${attrs} FROM ${tree.table} WHERE ${tree.field} = (SELECT ${tree.functionName}(${tree.aggregateField}) FROM ${tree.aggregateTable});`;
  }

  if (tree.type === "projectionNotExists") {
    const attrs = tree.attributes.map(attr => `C.${attr}`).join(", ");

    return `SELECT ${attrs} FROM ${tree.mainTable} C WHERE NOT EXISTS (SELECT * FROM ${tree.subTable} E WHERE E.${tree.joinField} = C.${tree.joinField});`;
  }

  const relation = tree.relation.relation;
  const condition = formatConditionForSQL(tree.relation.condition);

  if (relation.type === "cartesian") {
    const table1 = relation.left.name;
    const table2 = relation.right.name;
    const attrs = tree.attributes.join(", ");

    return `SELECT DISTINCT ${attrs} FROM ${table1}, ${table2} WHERE ${condition};`;
  }

  const attrs = tree.attributes.join(", ");
  const tableName = relation.name;

  return `SELECT DISTINCT ${attrs} FROM ${tableName} WHERE ${condition};`;
}

module.exports = {
  parseProjectionSelectionAR,
  formatConditionForCRT,
  formatConditionForSQL,
  treeToCRT,
  treeToSQL
};