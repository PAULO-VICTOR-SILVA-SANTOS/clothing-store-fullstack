import jwt from 'jsonwebtoken'

/**
 * Protege rotas de gestão quando `ADMIN_API_KEY` e/ou `JWT_SECRET` estão definidos.
 * Aceita, nesta ordem: JWT em `Authorization: Bearer`, depois `x-admin-key` / `x-api-key`,
 * depois `Authorization: Bearer` com o mesmo valor da chave (legado).
 * GET /produtos e POST /pedidos não usam este middleware.
 */
export function requireAdminWhenConfigured(req, res, next) {
  const apiKey = String(process.env.ADMIN_API_KEY || '').trim()
  const jwtSecret = String(process.env.JWT_SECRET || '').trim()

  if (!apiKey && !jwtSecret) return next()

  const h = req.headers
  const bearerRaw =
    typeof h.authorization === 'string' ? h.authorization.replace(/^Bearer\s+/i, '').trim() : ''
  const xKey =
    (typeof h['x-admin-key'] === 'string' && h['x-admin-key'].trim()) ||
    (typeof h['x-api-key'] === 'string' && h['x-api-key'].trim()) ||
    ''

  if (jwtSecret && bearerRaw) {
    try {
      jwt.verify(bearerRaw, jwtSecret)
      return next()
    } catch {
      /* continua: pode ser Bearer com a chave antiga */
    }
  }

  if (apiKey) {
    if (xKey === apiKey) return next()
    if (bearerRaw === apiKey) return next()
  }

  if (!apiKey && jwtSecret) {
    return res.status(401).json({ erro: 'Token JWT inválido ou ausente (Authorization: Bearer …)' })
  }

  return res.status(401).json({ erro: 'Chave de administrador inválida ou ausente (header x-admin-key)' })
}
