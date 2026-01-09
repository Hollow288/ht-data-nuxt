export function replaceTagWithColor(input: string | undefined, tag: string, color: string): string {
    const regex = new RegExp(`<${tag}>(.*?)</>`, 'g');
    return '' + input?.replace(regex, (_, content) => `<span style="color:#${color}">${content}</span>`);
}

const filePath : Record<string, string> = {
    '寒冰': 'icon_element_bing.webp',
    '物理': 'icon_element_wu.webp',
    '雷电': 'icon_element_lei.webp',
    '火焰': 'icon_element_huo.webp',
    '冰雷': 'icon_element_binglei.webp',
    '物火': 'icon_element_wuhuo.webp',
    '火物': 'icon_element_huowu.webp',
    '雷冰': 'icon_element_leibing.webp',
    '异能': 'icon_element_powers.webp',
    '强攻': 'icon_qianggong.webp',
    '坚毅': 'icon_fangyu.webp',
    '恩赐': 'icon_zengyi.webp',
    'SSR': 'yizhi_tips_zi_ssr.png',
    'SR': 'yizhi_tips_zi_sr.png',
    'R': 'yizhi_tips_zi_r.png',
}

export function returnTrueFilePathByName(type: string | undefined): string | undefined  {
    if (typeof type === 'undefined')
        return undefined
    return filePath[type]
}

export function getImgUrl(name: string | undefined): string {
    return new URL(`../assets/images/${name}`, import.meta.url).href
}

