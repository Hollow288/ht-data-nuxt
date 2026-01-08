import type {BaseRes} from "~/types/api";


export interface WeaponsListDto {
    weaponKey: string
    weaponName: string
    weaponCategory: string
    weaponRarity: string
    weaponElementType: string
    weaponIcon: string
}
export type WeaponsListDtoRes = BaseRes<WeaponsListDto[]>


export interface Weapons {
    weaponKey: string
    weaponName: string
    weaponIcon: string
    weaponRarity: string
    weaponElement: WeaponElement[]
    armorBroken: number
    charging: number
    description: string
    remouldDetail: string
    weaponSensualityLevelData: string[]
    weaponSkill: WeaponSkill[]
}
export type WeaponsRes = BaseRes<Weapons>

export interface WeaponElement {
    weaponElementType: string
    weaponElementName: string
    weaponElementDesc: string
}

export interface WeaponSkill {
    type: string
    name: string
    dynamicDes: string
    icon: string
    dynamicValue: number[][]
}