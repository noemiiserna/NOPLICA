/*
 * Traducción de operaciones binarias entre relaciones:
 * - Unión (∪)
 * - Intersección (∩)
 * - Producto cartesiano (×)
 * - Diferencia (-)
 */

function parseSetOperationAR(query) {
  const match = query.match(
    /^([\wÁÉÍÓÚáéíóúÑñ_]+)\s*(∪|∩|×|-)\s*([\wÁÉÍÓÚáéíóúÑñ_]+)$/
  );

  if (!match) {
    throw new Error("Formato de operación entre relaciones no válido");
  }

  let operationType;

  if (match[2] === "∪") {
    operationType = "union";
  } else if (match[2] === "∩") {
    operationType = "intersection";
  } else if (match[2] === "×") {
    operationType = "cartesian";
  } else if (match[2] === "-") {
    operationType = "difference";
  }

  return {
    type: operationType,
    left: { type: "table", name: match[1] },
    right: { type: "table", name: match[3] }
  };
}

function treeToCRT(tree) {
  if (tree.type === "union") {
    return `{ t | ${tree.left.name}(t) ∨ ${tree.right.name}(t) }`;
  }

  if (tree.type === "intersection") {
    return `{ t | ${tree.left.name}(t) ∧ ${tree.right.name}(t) }`;
  }

  if (tree.type === "cartesian") {
    return `{ t, u | ${tree.left.name}(t) ∧ ${tree.right.name}(u) }`;
  }

  if (tree.type === "difference") {
    return `{ t | ${tree.left.name}(t) ∧ ¬${tree.right.name}(t) }`;
  }

  throw new Error("Operación no soportada");
}

function treeToSQL(tree) {
  if (tree.type === "union") {
    return `SELECT * FROM ${tree.left.name} UNION SELECT * FROM ${tree.right.name};`;
  }

  if (tree.type === "intersection") {
    return `SELECT * FROM ${tree.left.name} INTERSECT SELECT * FROM ${tree.right.name};`;
  }

  if (tree.type === "cartesian") {
    return `SELECT * FROM ${tree.left.name}, ${tree.right.name};`;
  }

  if (tree.type === "difference") {
    return `SELECT * FROM ${tree.left.name} EXCEPT SELECT * FROM ${tree.right.name};`;
  }

  throw new Error("Operación no soportada");
}

module.exports = {
  parseSetOperationAR,
  treeToCRT,
  treeToSQL
};