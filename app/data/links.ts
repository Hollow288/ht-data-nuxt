export type Link = {
  name: string
  desc: string
  icon: string
  url: string
}

const placeholderLinks: Link[] = [
  { name: 'GitHub', desc: '@your-handle', icon: 'ri-github-fill', url: 'https://github.com/your-handle' },
  { name: 'Bilibili', desc: '我的B站主页', icon: 'ri-bilibili-fill', url: '#' },
  { name: '博客', desc: '记录与分享', icon: 'ri-quill-pen-line', url: '#' },
  { name: '邮箱', desc: '与我联系', icon: 'ri-mail-fill', url: 'mailto:youremail@example.com' },
]

const overrides = import.meta.glob<{ default: Link[] }>('./links.local.ts', { eager: true })
const local = overrides['./links.local.ts']?.default

export const links: Link[] = local ?? placeholderLinks
