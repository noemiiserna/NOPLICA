function parseSimpleAR(query) {
  const match = query.match(/^π\s+([\wÁÉÍÓÚáéíóúÑñ_\s,]+)\s+\(([\wÁÉÍÓÚáéíóúÑñ_]+)\)$/);

  if (!match) {
    throw new Error("Formato no válido");
  }

  const attributes = match[1]
    .split(",")
    .map(attr => attr.trim());

  return {
    type: "projection",
    attributes,
    relation: {
      type: "table",
      name: match[2]
    }
  };
}

function treeToCRT(tree) {
  const attrs = tree.attributes.map(attr => `t.${attr}`).join(", ");
  return `{ ${attrs} | ${tree.relation.name}(t) }`;
}

function treeToSQL(tree) {
  const attrs = tree.attributes.join(", ");
  return `SELECT DISTINCT ${attrs} FROM ${tree.relation.name};`;
}

module.exports = {
  parseSimpleAR,
  treeToCRT,
  treeToSQL
};