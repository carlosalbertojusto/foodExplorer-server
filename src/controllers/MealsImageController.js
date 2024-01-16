const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class MealsImageController {
    async update(request, response){

        const { meal_id } = request.body;
        const user_id = request.user.id;

        const diskStorage = new DiskStorage();
       

        const imgMealFilename = request.file.filename;
       


        const user = await knex("users").where({ id: user_id }).first();


        if(!user) {
            throw new AppError("Somente usuário com permissão de Administrador pode mudar a imagem", 401);
        }

        const meal = await knex("meals")
        .where({ id: meal_id, user_id }).first();

        if(!meal){
            throw new AppError("Prato não existe", 404);
        }

        if(meal.imgMeal){
            await diskStorage.deleteFile(meal.imgMeal);
        }


        const filename = await diskStorage.saveFile(imgMealFilename);
        meal.imgMeal = filename;

        await knex("meals").update(meal).where({ id: meal_id });

        return response.json(meal);
    }
}

module.exports = MealsImageController;