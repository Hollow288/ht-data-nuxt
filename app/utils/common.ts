export function replaceTagWithColor(input: string | undefined, tag: string, color: string): string {
    const regex = new RegExp(`<${tag}>(.*?)</>`, 'g');
    return '&nbsp;&nbsp;&nbsp;' + input?.replace(regex, (_, content) => `<span style="color:#${color}">${content}</span>`);
}