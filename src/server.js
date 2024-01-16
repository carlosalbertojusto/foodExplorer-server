require('express-async-errors')
require('dotenv').config()

const uploadConfig = require('./configs/upload')
const AppError = require('./utils/AppError')

const cors = require('cors')
const express = require('express')
const routes = require('./routes')


const app = express()
app.use(cors())
app.use(express.json())
app.use('/files', express.static(uploadConfig.UPLOADS_FOLDER))

app.use(routes)
app.use((error, request, response, next) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    })
  }
  console.error(error)
  return response.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  })
})


app.listen(process.env.BACK_PORT, () => console.log(`Server is listening on port ${process.env.BACK_PORT}`))
