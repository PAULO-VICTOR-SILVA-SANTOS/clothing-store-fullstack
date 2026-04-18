import { Router } from 'express'
import jwt from 'jsonwebtoken'

/** POST /auth/login — troca senha do lojista por JWT (não expor segredo no bundle do Vite). */
export function createAuthRouter() {
  const r = Router()
  r.post('/login', (req, res) => {
    const jwtSecret = String(process.env.JWT_SECRET || '').trim()
    if (!jwtSecret) {
      return res.status(503).json({ erro: 'Login JWT inativo: defina JWT_SECRET no servidor.' })
    }
    const pwd = typeof req.body?.password === 'string' ? req.body.password : ''
    const expected = String(process.env.ADMIN_PASSWORD || process.env.ADMIN_API_KEY || '').trim()
    if (!expected) {
      return res.status(503).json({ erro: 'Defina ADMIN_PASSWORD ou ADMIN_API_KEY no servidor para permitir login.' })
    }
    if (pwd !== expected) {
      return res.status(401).json({ erro: 'Senha inválida' })
    }
    const token = jwt.sign({ role: 'lojista' }, jwtSecret, { expiresIn: '8h' })
    res.json({ token, tokenType: 'Bearer', expiresInSec: 8 * 3600 })
  })
  return r
}
