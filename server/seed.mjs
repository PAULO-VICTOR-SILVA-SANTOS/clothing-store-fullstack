import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Product } from './models/Product.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, 'data', 'produtos.json')

export async function seedProductsIfEmpty() {
  const n = await Product.countDocuments()
  if (n > 0) return 0
  if (!fs.existsSync(DATA_FILE)) return 0
  const raw = fs.readFileSync(DATA_FILE, 'utf8')
  const data = JSON.parse(raw)
  if (!Array.isArray(data) || data.length === 0) return 0
  const docs = data.map((row) => {
    const {
      id: _omit,
      _id: __omit,
      nome,
      marca,
      categoria,
      subcategoria,
      preco,
      imagens,
      estoque,
      uso,
      modelo,
      custom
    } = row
    const imgs = Array.isArray(imagens) ? imagens.filter(Boolean) : []
    return {
      nome: nome || 'Produto',
      marca: marca || '—',
      categoria: categoria || 'Outros',
      subcategoria: subcategoria || undefined,
      preco: typeof preco === 'number' ? preco : 0,
      imagens:
        imgs.length > 0
          ? imgs
          : ['https://placehold.co/400x220/e8f0fe/1a3a6b?text=Foto'],
      estoque: Math.max(0, Math.floor(Number(estoque) || 0)),
      uso: uso || '',
      modelo: !!modelo,
      custom: !!custom
    }
  })
  await Product.insertMany(docs)
  console.log(`[seed] ${docs.length} produto(s) importados de data/produtos.json`)
  return docs.length
}
