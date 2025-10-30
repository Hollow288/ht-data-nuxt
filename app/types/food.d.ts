import type {BaseRes} from "~/types/api";


export interface FoodListDto {
    foodKey: string
    foodName: string
    foodIcon: string
}
export type FoodListDtoRes = BaseRes<FoodListDto[]>


export interface Food {
    foodKey: string
    foodName: string
    foodDes: string
    foodIcon: string
    source: string
    useDescription: string
    buffs: string
}
export type FoodRes = BaseRes<Food>