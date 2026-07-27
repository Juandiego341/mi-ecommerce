import { defineConfig } from '@prisma/config'
import 'dotenv/config'

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  // El CLI busca esta propiedad específica para comandos como 'migrate' y 'db pull'
  datasource: {
    url: process.env.DATABASE_URL,
  },
  // Tu configuración de adapter para el runtime (opcional aquí, pero útil)
  client: {
    adapter: async () => {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      const { default: pg } = await import('pg')
      const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      })
      return new PrismaPg(pool)
    }
  }
})