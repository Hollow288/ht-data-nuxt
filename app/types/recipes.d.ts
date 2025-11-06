import type {BaseRes} from "~/types/api";

export interface RecipesListDto {
    recipesKey: string
    recipesName: string
    recipesIcon: string
}
export type RecipesListDtoRes = BaseRes<RecipesListDto[]>


export interface Recipes {
    recipesKey: string
    recipesName: string
    recipesDes: string
    recipesIcon: string
    categories: string
    useDescription: string
    buffs: string
    ingredientsList: ingredients[]
}
export type RecipesRes = BaseRes<Recipes>



export interface ingredients {
    ingredientKey: string
    ingredientNum: int
    ingredientName: string
    ingredientIcon: string
}