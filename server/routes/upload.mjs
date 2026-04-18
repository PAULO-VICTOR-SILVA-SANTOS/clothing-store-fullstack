import express from 'express'
import multer from 'multer'
import path from 'path'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'
import { requireAdminWhenConfigured } from '../middleware/adminAuth.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')

const limits = { fileSize: 8 * 1024 * 1024, files: 10 }

/**
 * @param {string} dir
 * @param {string} [publicBase] URL pública da API — prefixa URLs no modo disco.
 */
export function createUploadRouter(dir, publicBase = '') {
  const r = express.Router()
  const base = String(publicBase || '').replace(/\/$/, '')
  const useCloudinary = Boolean(process.env.CLOUDINARY_URL?.trim())
  const cloudFolder = (process.env.CLOUDINARY_UPLOAD_FOLDER || 'castro-pedidos').replace(/^\/+|\/+$/g, '')

  const uploadDisk = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, dir)
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname || '') || '.jpg'
        cb(null, `${randomUUID()}${ext}`)
      }
    }),
    limits
  })

  const uploadMem = multer({
    storage: multer.memoryStorage(),
    limits
  })

  /** POST /upload — multipart campo `arquivos` (até 10). Com `CLOUDINARY_URL`, envia ao Cloudinary. */
  r.post(
    '/',
    requireAdminWhenConfigured,
    useCloudinary ? uploadMem.array('arquivos', 10) : uploadDisk.array('arquivos', 10),
    (req, res) => {
      if (useCloudinary) {
        void handleCloudinaryUpload(req, res, cloudFolder)
        return
      }
      try {
        const files = req.files
        if (!files || !Array.isArray(files) || files.length === 0) {
          return res.status(400).json({ erro: 'Envie um ou mais arquivos no campo arquivos' })
        }
        const urls = files.map((f) => {
          const p = `/uploads/${f.filename}`
          return base ? `${base}${p}` : p
        })
        res.json({ urls })
      } catch (e) {
        console.error(e)
        res.status(500).json({ erro: 'Falha no upload' })
      }
    }
  )

  return r
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string} folder
 */
async function handleCloudinaryUpload(req, res, folder) {
  try {
    const files = req.files
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ erro: 'Envie um ou mais arquivos no campo arquivos' })
    }
    const mod = await import('cloudinary')
    const cloudinary = mod.default
    cloudinary.config({ secure: true })
    const urls = []
    for (const file of files) {
      const buf = file.buffer
      if (!buf || !buf.length) continue
      const mime = file.mimetype || 'image/jpeg'
      const dataUri = `data:${mime};base64,${buf.toString('base64')}`
      const out = await cloudinary.uploader.upload(dataUri, {
        folder,
        resource_type: 'image'
      })
      if (out?.secure_url) urls.push(out.secure_url)
    }
    if (!urls.length) {
      return res.status(400).json({ erro: 'Nenhuma imagem válida para enviar ao Cloudinary' })
    }
    res.json({ urls })
  } catch (e) {
    console.error(e)
    res.status(500).json({ erro: 'Falha no upload (Cloudinary). Verifique CLOUDINARY_URL e quotas.' })
  }
}
