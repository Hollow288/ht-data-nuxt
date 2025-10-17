import type {BaseRes} from "~/types/api";

export interface BlogDateMenuItem {
    yearMonth: string
    count: number
}
export type BlogDateMenuRes = BaseRes<BlogDateMenuItem[]>

export interface BlogItem {
    blogId: number
    title: string
    summary: string
    createdAt: string
}
export type BlogDateListRes = BaseRes<BlogItem[]>

export interface BlogPost {
    blogId: number
    title: string
    summary: string
    content: string
    createdAt: string
}
export type BlogPostRes = BaseRes<BlogPost>