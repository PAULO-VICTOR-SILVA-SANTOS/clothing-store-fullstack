import mongoose from 'mongoose'

/**
 * Conecta no MongoDB
 * @param {string} uri
 */
export async function connectMongo(uri) {
  try {
    mongoose.set('strictQuery', true)

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // evita travamento
      dbName: 'castro_pedidos', // 🔥 garante banco correto
    })

    console.log('[db] MongoDB conectado com sucesso')
  } catch (error) {
    console.error('[db] Erro ao conectar no Mongo:', error.message)
    throw error
  }
}

/**
 * Verifica se o Mongo está conectado
 */
export function isMongoReady() {
  return mongoose.connection.readyState === 1
}