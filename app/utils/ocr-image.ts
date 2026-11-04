/** 将图片像素按顺时针方向旋转，生成可直接提交给 OCR 的文件。 */
export async function rotateOcrImage(file: File, degrees: number): Promise<File> {
  const rotation = ((degrees % 360) + 360) % 360
  if (rotation === 0) return file
  if (![90, 180, 270].includes(rotation)) throw new Error('仅支持按 90° 调整图片方向')

  const sourceUrl = URL.createObjectURL(file)
  const image = new Image()
  let canvas: HTMLCanvasElement | null = null
  try {
    image.src = sourceUrl
    try {
      await image.decode()
    } catch {
      throw new Error('浏览器无法读取此图片，请先转换为 JPG 或 PNG 后再调整方向')
    }

    canvas = document.createElement('canvas')
    const swapSize = rotation === 90 || rotation === 270
    canvas.width = swapSize ? image.naturalHeight : image.naturalWidth
    canvas.height = swapSize ? image.naturalWidth : image.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) throw new Error('当前浏览器不支持调整图片方向')

    context.translate(canvas.width / 2, canvas.height / 2)
    context.rotate(rotation * Math.PI / 180)
    context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2)

    // 使用无损 PNG，保留文字清晰度，同时移除原图的方向元数据。
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas!.toBlob(result => {
        if (result) resolve(result)
        else reject(new Error('图片处理失败，请尝试较小的图片'))
      }, 'image/png')
    })
    const name = file.name.replace(/\.[^.]+$/, '') || 'image'
    return new File([blob], `${name}-rotated.png`, { type: 'image/png' })
  } finally {
    URL.revokeObjectURL(sourceUrl)
    if (canvas) {
      canvas.width = 0
      canvas.height = 0
    }
  }
}
