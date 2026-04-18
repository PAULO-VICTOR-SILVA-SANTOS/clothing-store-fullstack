import mongoose from 'mongoose'

/**
 * @param {string} uri
 */
export async function connectMongo(uri) {
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  console.log('[db] MongoDB conectado')
}

export function isMongoReady() {
  return mongoose.connection.readyState === 1
}
