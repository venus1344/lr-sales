import { prisma } from '../lib/prisma'

async function main() {
  const users = await prisma.users.count()
  const customers = await prisma.customers.count()
  const items = await prisma.items.count()
  const invoices = await prisma.invoices.count()
  const proformas = await prisma.proformas.count()

  console.log('DB connected successfully.')
  console.log({ users, customers, items, invoices, proformas })

  const firstUser = await prisma.users.findFirst()
  console.log('first user:', firstUser?.name, `<${firstUser?.email}>`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('DB check failed:', error)
    process.exit(1)
  })
