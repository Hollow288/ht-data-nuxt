import {Base} from "#components";

export interface BlogDateMenuItem {
    yearMonth: string
    count: number
}
export type BlogDateMenuRes = BaseRes<BlogDateMenuItem[]>

export interface BaseRes<T> {
    code: number
    msg: string
    data: T
}

export interface ImageInfo {
    url: string
    name: string
}

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


