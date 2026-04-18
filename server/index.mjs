import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectMongo } from './db.mjs'
import { buildApp } from './app.mjs'
import { seedProductsIfEmpty } from './seed.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')

dotenv.config({ path: path.join(rootDir, '.env') })

const app = buildApp()
const PORT = Number(process.env.PORT) || 3000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/castro_pedidos'

async function main() {
  try {
    await connectMongo(MONGODB_URI)
    await seedProductsIfEmpty()
  } catch (e) {
    console.error('[api] Falha ao conectar no MongoDB:', e?.message || e)
    console.error('Suba o MongoDB: docker compose up -d   (na pasta do projeto)')
    process.exit(1)
  }

  app.listen(PORT, () => {
    if (process.env.JWT_SECRET) {
      console.log('[api] JWT_SECRET definida — rotas de gestão aceitam Authorization: Bearer <token> (POST /auth/login)')
    }
    if (process.env.ADMIN_API_KEY) {
      console.log('[api] ADMIN_API_KEY definida — gestão também aceita header x-admin-key (ou Bearer com o mesmo valor)')
    }
    if (process.env.CLOUDINARY_URL) {
      console.log('[api] CLOUDINARY_URL definida — POST /upload usa Cloudinary (pasta:', process.env.CLOUDINARY_UPLOAD_FOLDER || 'castro-pedidos', ')')
    }
    if (String(process.env.HELMET_DISABLE || '').toLowerCase() === 'true') {
      console.log('[api] HELMET_DISABLE=true — cabeçalhos Helmet desativados')
    } else {
      console.log('[api] Helmet ativo (CSP na API; CORP cross-origin para Vite + /uploads). Defina HELMET_DISABLE=true para desligar.')
    }
    console.log(`[api] http://localhost:${PORT}`)
    console.log(`  POST /auth/login`)
    console.log(`  GET  /produtos`)
    console.log(`  POST /produtos`)
    console.log(`  PATCH /produtos/:id`)
    console.log(`  DELETE /produtos/:id`)
    console.log(`  POST /upload (multipart arquivos)`)
    console.log(`  POST /pedidos`)
    console.log(`  GET  /pedidos`)
  })
}

main()
