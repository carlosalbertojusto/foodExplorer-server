const knex = require("../database/knex")
const DiskStorage = require("../providers/DiskStorage")

class MealsController {
  async create(request, response) {
    const { title, description, category, price, ingredients } = request.body

    const user_id = request.user.id

    const [meals_id] = await knex("meals").insert({
      title,
      description,
      category,
      price,
      user_id,
    })

    const ingredientsInsert = ingredients.map((name) => {
      return {
        meals_id,
        name,
        user_id,
      }
    })

    await knex("ingredients").insert(ingredientsInsert)

    return response.status(201).json(meals_id)
  }

  async update(request, response) {
    const { id } = request.params
    const { title, description, category, price, ingredients } = request.body

    const user_id = request.user.id
    const { meal_id } = request.body
    const imgMealFilename = request.file?.filename
    const meals_id = await knex("meals").where({ id }).first()

    if (!meals_id) {
      throw new AppError("Prato não encontrado.")
    }

    const mealUpdate = {
      title,
      description,
      category,
      price,
    }

    if (imgMealFilename) {
      const diskStorage = new DiskStorage()

      const meal = await knex("meals").where({ id: meal_id, user_id }).first()

      if (meal.imgMeal) {
        await diskStorage.deleteFile(meal.imgMeal)
      }

      const filename = await diskStorage.saveFile(imgMealFilename)
      meal.imgMeal = filename

      await knex("meals").update(meal).where({ id: meal_id })
      return response.json(meal)
    } else {
      console.log("Não há imagem definida")
    }

    if (Object.keys(ingredients).length > 0) {
      const ingredientsInsert = ingredients.map((name) => {
        return {
          meals_id: id,
          name,
          user_id,
        }
      })

      if (Object.keys(ingredientsInsert).length > 0) {
        await knex("ingredients").where("meals_id", id).delete()
        await knex("ingredients").insert(ingredientsInsert)
      }
    }

    await knex("meals").where({ id }).update(mealUpdate)

    return response.json()
  }

  async show(request, response) {
    const { id } = request.params

    const meals = await knex("meals").where({ id }).first()
    const ingredients = await knex("ingredients")
      .where({ meals_id: id })
      .orderBy("name")

    return response.json({
      ...meals,
      ingredients,
    })
  }

  async delete(request, response) {
    const { id } = request.params

    await knex("meals").where({ id }).delete()

    return response.json()
  }

  async index(request, response) {
    const { title } = request.query

    const user_id = request.user.id

    let meals

    if (title) {
      const mealsByTitle = await knex("meals")
        .whereLike("title", `%${title}%`)
        .orderBy("title")

      if (mealsByTitle.length === 0) {
        const mealsByIngredients = await knex("ingredients")
          .select("meals.*")
          .where("ingredients.name", "like", `%${title}%`)
          .innerJoin("meals", "meals.id", "ingredients.meals_id")
          .orderBy("meals.title")
          .groupBy("meals.id")

        meals = mealsByIngredients
      } else {
        meals = mealsByTitle
      }
    } else {
      meals = await knex("meals")
        .whereLike("title", `%${title}%`)
        .orderBy("title")
    }

    const userIngredients = await knex("ingredients").where({ user_id })
    const mealsWithIngredients = meals.map((meals) => {
      const mealsIngredients = userIngredients.filter(
        (tag) => tag.meals_id === meals.id
      )

      return {
        ...meals,
        ingredients: mealsIngredients,
      }
    })

    return response.json(mealsWithIngredients)
  }
}

module.exports = MealsController
