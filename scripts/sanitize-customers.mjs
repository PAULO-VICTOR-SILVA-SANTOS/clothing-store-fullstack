import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/castro_pedidos'

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { strict: false, collection: 'orders' }
)

const Order = mongoose.model('Order', orderSchema)

const replacementCustomer = {
  cpf: '',
  nome: '',
  nomeCompleto: '',
  endereco: '',
  enderecoCompleto: '',
  rua: '',
  numero: '',
  bairro: '',
  complemento: '',
  cidade: '',
  uf: '',
  cep: ''
}

async function run() {
  await mongoose.connect(uri)

  const totalBefore = await Order.countDocuments({})
  const totalWithCustomer = await Order.countDocuments({ customer: { $exists: true, $ne: null } })

  const res = await Order.updateMany(
    { customer: { $exists: true, $ne: null } },
    { $set: { customer: replacementCustomer } }
  )

  console.log(`[sanitize-customers] URI: ${uri}`)
  console.log(`[sanitize-customers] Pedidos totais: ${totalBefore}`)
  console.log(`[sanitize-customers] Pedidos com customer: ${totalWithCustomer}`)
  console.log(`[sanitize-customers] Matched: ${res.matchedCount}, Modified: ${res.modifiedCount}`)
}

run()
  .catch((err) => {
    console.error('[sanitize-customers] Erro:', err?.message || err)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
