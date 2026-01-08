import type {BaseRes} from "~/types/api";


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
}

export interface detail {
    type: string
    desc: string
}


export type MatrixRes = BaseRes<Matrix>