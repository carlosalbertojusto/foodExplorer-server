const { Router } = require('express')
const multer = require('multer')
const uploadConfig = require('../configs/upload')

const UsersController = require('../controllers/UsersController')
const UserAvatarController = require('../controllers/MealsImageController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')

const usersRoutes = Router()
const upload = multer(uploadConfig.MULTER)

const usersController = new UsersController()
const userAvatarController = new UserAvatarController()

usersRoutes.post('/', usersController.create)
usersRoutes.put('/', ensureAuthenticated, usersController.update)

module.exports = usersRoutes
