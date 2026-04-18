const MAX_IMAGENS = 10

/**
 * @param {import('mongoose').Document} doc
 */
export function toApiProduct(doc) {
  const o = doc && typeof doc.toObject === 'function' ? doc.toObject() : doc
  const idVal = o._id ?? o.id
  return {
    id: String(idVal),
    nome: o.nome,
    marca: o.marca,
    categoria: o.categoria,
    subcategoria: o.subcategoria || undefined,
    preco: o.preco,
    imagens: Array.isArray(o.imagens) ? o.imagens.slice(0, MAX_IMAGENS) : [],
    estoque: Math.max(0, Math.floor(Number(o.estoque) || 0)),
    uso: o.uso || '',
    modelo: !!o.modelo,
    custom: !!o.custom
  }
}

export function sanitizeImagens(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map((x) => String(x).trim()).filter(Boolean).slice(0, MAX_IMAGENS)
}
