import type {BaseRes} from "~/types/api";


export interface ArtifactListDto {
    artifactKey: string
    artifactName: string
    artifactRarity: string
    artifactThumbnail: string
}
export type ArtifactListDtoRes = BaseRes<ArtifactListDto[]>


export interface Artifact {
    artifactKey: string
    artifactName: string
    artifactRarity: string
    useDescription: string
    artifactIcon: string
    artifactDetail: string[]
}
export type ArtifactRes = BaseRes<Artifact>