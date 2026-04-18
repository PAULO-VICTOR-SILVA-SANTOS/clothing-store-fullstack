import cors from 'cors'
import express from 'express'
import fs from 'fs'
import { UPLOAD_DIR, createUploadRouter } from './routes/upload.mjs'
import { produtosRouter } from './routes/produtos.mjs'
import { pedidosRouter } from './routes/pedidos.mjs'
import { createAuthRouter } from './routes/auth.mjs'
import { createSecurityMiddleware } from './middleware/securityHeaders.mjs'

/** Aplicação Express (rotas + middleware). Sem MongoDB e sem `listen`. */
export function buildApp() {
  const app = express()
  app.set('trust proxy', 1)
  app.use(createSecurityMiddleware())
  app.use(cors())
  app.use(express.json({ limit: '12mb' }))

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }

  app.use('/uploads', express.static(UPLOAD_DIR))

  app.get('/health', (_req, res) => {
    res.json({ ok: true, mongo: true })
  })

  app.use('/auth', createAuthRouter())
  app.use('/produtos', produtosRouter)
  const PUBLIC_API_URL = (process.env.PUBLIC_API_URL || '').trim()
  app.use('/upload', createUploadRouter(UPLOAD_DIR, PUBLIC_API_URL))
  app.use('/pedidos', pedidosRouter)

  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ erro: 'Erro interno do servidor' })
  })

  return app
}
