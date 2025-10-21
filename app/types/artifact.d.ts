import type {BaseRes} from "~/types/api";


export interface ArtifactListDto {
    artifactKey: string
    artifactName: string
    artifactRarity: string
    artifactThumbnail: string
}
export type ArtifactListDtoRes = BaseRes<ArtifactListDto[]>