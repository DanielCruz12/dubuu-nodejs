import app from './app'

const port = process.env.PORT || 3000

async function main() {
  try {
    console.log('✅ Database connected')
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`)
    })
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error)
  }
}

main()
