const sqliteConnection = require('../database/sqlite')
const { hash, compare } = require('bcryptjs')
const AppError = require('../utils/AppError')

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body
    const database = await sqliteConnection()
    const checkUserExists = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    )
    if (checkUserExists) {
      throw new AppError('o e-mail já está sendo utilizado.')
    }
    const firstUser = await database.get('SELECT COUNT(*) AS user_count FROM users')
    
    const hashedPassword = await hash(password, 8)
    
  
    if (firstUser.user_count === 0) {
      await database.run(
        'INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
        [name, email, hashedPassword, 'admin']
      )
      return response.status(201).json()
    }


    await database.run(
      'INSERT INTO users (name,email,password, role) VALUES (?,?,?,?)',
      [name, email, hashedPassword, 'user']
    )
    response.status(201).json()
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body
    const user_id = request.user.id

    const database = await sqliteConnection()
    const user = await database.get('SELECT * FROM users WHERE id = (?)', [
      user_id,
    ])

    if (!user) {
      throw new AppError('Usuário não encontrado!')
    }

    const userWithUpdatedEmail = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    )

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError('Este e-mail já está sendo utilizado!')
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    if (!old_password) {
      throw new AppError('Você precisa informar a senha antiga.')
    }

    if (password === old_password) {
      throw new AppError('A Nova senha não pode ser a mesma da atual.')
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password)

      if (!checkOldPassword) {
        throw new AppError('A senha informada não confere com a antiga.')
      }

      user.password = await hash(password, 8)
    }

    await database.run(
      `
    UPDATE users SET
    name = ?,
    email = ?,
    password = ?,
    updated_at = DATETIME('now')
    WHERE id = ?
    `,
      [user.name, user.email, user.password, user_id]
    )

    return response.json()
  }
}

module.exports = UsersController
