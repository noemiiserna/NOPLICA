function parseAggregationAR(query) {

  // Caso 1:
  // Agrupación sobre dos tablas con selección previa y cláusula HAVING.
  // Ejemplo:
  // γ nomeq ; COUNT(netapa) → total HAVING COUNT(netapa) > 2
  // (σ etapa.dorsal = ciclista.dorsal (etapa × ciclista))

  const joinHavingMatch = query.match(
    /^γ\s+([\wÁÉÍÓÚáéíóúÑñ_]+)\s*;\s*(COUNT|MIN|MAX|AVG|SUM)\((\*|[\wÁÉÍÓÚáéíóúÑñ_]+)\)\s*→\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s+HAVING\s+(.+)\s+\(σ\s+(.+)\s+\(([\wÁÉÍÓÚáéíóúÑñ_]+)\s*×\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\)\)$/i
  );

  if (joinHavingMatch) {
    return {
      type: "aggregationJoinHaving",
      groupBy: joinHavingMatch[1],
      functionName: joinHavingMatch[2],
      attribute: joinHavingMatch[3],
      alias: joinHavingMatch[4],
      having: joinHavingMatch[5],
      condition: joinHavingMatch[6],
      leftTable: joinHavingMatch[7],
      rightTable: joinHavingMatch[8]
    };
  }

  // Caso 2:
  // Agrupación simple sobre una única tabla.
  // Ejemplo:
  // γ nomeq ; COUNT(*) → num_ciclistas (ciclista)

  const match = query.match(
    /^γ\s*([\wÁÉÍÓÚáéíóúÑñ_]+)?\s*;\s*(COUNT|MIN|MAX|AVG|SUM)\((\*|[\wÁÉÍÓÚáéíóúÑñ_]+)\)\s*→\s*([\wÁÉÍÓÚáéíóúÑñ_]+)\s+\(([\wÁÉÍÓÚáéíóúÑñ_]+)\)$/i
  );

  if (match) {
    return {
      type: "aggregation",
      groupBy: match[1] || null,
      functionName: match[2],
      attribute: match[3],
      alias: match[4],
      table: match[5]
    };
  }

  throw new Error("Formato de agrupación no válido");
}

function treeToCRT() {
  // La agrupación no dispone de una traducción estándar a Cálculo Relacional de Tuplas.
  return "La agrupación no tiene una traducción directa estándar a CR básico.";
}

function formatConditionForSQL(condition) {
  return condition
    .replace(/∧/g, "AND")
    .replace(/∨/g, "OR")
    .replace(/¬/g, "NOT")
    .replace(/\s+/g, " ")
    .trim();
}

function treeToSQL(tree) {

  // Caso 1:
  // Generación de SQL para una agrupación sobre dos tablas
  // con selección previa y cláusula HAVING.

  if (tree.type === "aggregationJoinHaving") {
    const condition = formatConditionForSQL(tree.condition);
    const having = formatConditionForSQL(tree.having);

    return `SELECT ${tree.groupBy}, ${tree.functionName}(${tree.attribute}) AS ${tree.alias} FROM ${tree.leftTable}, ${tree.rightTable} WHERE ${condition} GROUP BY ${tree.groupBy} HAVING ${having};`;
  }

  // Caso 2:
  // Generación de SQL para una agrupación simple con GROUP BY.

  if (tree.groupBy) {
    return `SELECT ${tree.groupBy}, ${tree.functionName}(${tree.attribute}) AS ${tree.alias} FROM ${tree.table} GROUP BY ${tree.groupBy};`;
  }

  // Caso 3:
  // Generación de SQL para una función de agregación sin GROUP BY.

  return `SELECT ${tree.functionName}(${tree.attribute}) AS ${tree.alias} FROM ${tree.table};`;
}

module.exports = {
  parseAggregationAR,
  treeToCRT,
  treeToSQL
};
