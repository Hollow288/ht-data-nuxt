export function replaceOnce(input: string | undefined, tag: string, color: string): string {
    const regex = new RegExp(`<${tag}>(.*?)</>`, 'g');
    return '' + input?.replace(regex, (_, content) => `<span style="color:#${color}">${content}</span>`);
}

export function replaceTagWithColor(
    input: string | undefined,
    tag?: string,
    color?: string
): string {
    if (!input) return '';

    // ✅ 只传 input：走默认规则
    if (!tag && !color) {
        let result = input;
        result = replaceOnce(result, 'shuzhi', 'C94F4F');
        result = replaceOnce(result, 'yellow_lbl_14_1', 'C3A652');
        return result;
    }

    // ✅ 正常单次替换（保持原有逻辑）
    if (tag && color) {
        return replaceOnce(input, tag, color);
    }

    // 兜底
    return input;
}

export function fillTemplate(
    template: string,
    values: number[][],
    index: number
): string {
    return template.replace(/\{(\d+)\}/g, (_, n) => {
        const arrayIndex = Number(n);
        const value = values[arrayIndex]?.[index - 1];

        // 防止越界或 undefined
        return value !== undefined ? String(value) : '';
    });
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

