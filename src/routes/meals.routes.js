const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const MealsController = require("../controllers/MealsController");
const MealsImageController = require("../controllers/MealsImageController");

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const adminMiddleware = require("../middlewares/adminMiddleware");

const mealsRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const mealsController = new MealsController();
const mealsImageController = new MealsImageController();


mealsRoutes.use(ensureAuthenticated);

mealsRoutes.get("/", ensureAuthenticated, mealsController.index);
mealsRoutes.post("/", adminMiddleware("user"), mealsController.create);
mealsRoutes.put("/:id", adminMiddleware("user"),mealsController.update);
mealsRoutes.get("/:id", mealsController.show);
mealsRoutes.delete("/:id", adminMiddleware("user"), mealsController.delete);
mealsRoutes.patch("/", adminMiddleware("user"),ensureAuthenticated, upload.single("imgMeal"), mealsImageController.update)

module.exports = mealsRoutes;