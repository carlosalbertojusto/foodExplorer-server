const sqlite3 = require('sqlite3')
const sqlite = require('sqlite')
require('dotenv').config()
const path = require('path')

async function sqlConnection(){
  const database = await sqlite.open({
    client: process.env.DB_CLIENT,
    filename: path.resolve(__dirname, "..", "database.db"),
    driver: sqlite3.Database
  })
  return database
}

module.exports = sqlConnection