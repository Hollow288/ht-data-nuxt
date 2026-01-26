import type {BaseRes} from "~/types/api";

export interface MatrixSuit {
    itemName: string
    slotIndex: string
    type: string
    typeIcon: string
    matrixMaxStrengthenLevel: number
    matrixMaxStarLevel: number
    description: string

    // 升级属性加成（二维数组）
    matrixUpgradeAttribute: number[][]

    // 基础属性
    matrixModifyData: MatrixModifyData[]

    // 星级加成系数
    matrixCoefficientList: number[]
}

export interface MatrixModifyData {
    propName: string
    propChsName: string
    propValue: number
    modifierOp: string
    attributeIcon: string
}


export interface MatrixListDto {
    matrixKey: string
    matrixName: string
    matrixQuality: string
    matrixThumbnail: string
}
export type MatrixListDtoRes = BaseRes<MatrixListDto[]>


export interface Matrix {
    matrixKey: string
    matrixName: string
    matrixQuality: string
    matrixIcon: string
    matrixDetail: detail[]
    matrixSuitList: MatrixSuit[]
}

export interface detail {
    type: string
    desc: string
}


export type MatrixRes = BaseRes<Matrix>