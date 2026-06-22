// Convierte una selección simple de AR en un árbol
function parseSimpleSelectionAR(query) {
  const match = query.match(/^σ\s+(.+)\s+\(([\wÁÉÍÓÚáéíóúÑñ_]+)\)$/);

  if (!match) {
    throw new Error("Formato no válido");
  }

  return {
    type: "selection",
    condition: match[1],
    relation: {
      type: "table",
      name: match[2]
    }
  };
}

// Añade t. delante de los atributos dentro de la condición
function formatConditionForCRT(condition) {
  let crtCondition = condition;

  crtCondition = crtCondition.replace(
    /\b([\wÁÉÍÓÚáéíóúÑñ_]+)\s*(>=|<=|=|>|<)\s*/g,
    "t.$1 $2 "
  );

  return crtCondition;
}

// Convierte la condición de AR a SQL
function formatConditionForSQL(condition) {
  return condition
    .replace(/∧/g, "AND")
    .replace(/∨/g, "OR")
    .replace(/¬/g, "NOT");
}

// Convierte el árbol en CRT
function treeToCRT(tree) {
  const crtCondition = formatConditionForCRT(tree.condition);

  return `{ t | ${tree.relation.name}(t) ∧ ${crtCondition} }`;
}

// Convierte el árbol en SQL
function treeToSQL(tree) {
  const sqlCondition = formatConditionForSQL(tree.condition);

  return `SELECT * FROM ${tree.relation.name} WHERE ${sqlCondition};`;
}

module.exports = {
  parseSimpleSelectionAR,
  formatConditionForCRT,
  formatConditionForSQL,
  treeToCRT,
  treeToSQL,
};