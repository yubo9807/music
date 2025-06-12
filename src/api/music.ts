import request from "./request";

export type MusicItem = {
  name:   string
  author: string
  path:   string
  type:   string
  ext:    string
  size:   number
  time:   number
}
export async function api_getMusicList(): Promise<MusicItem[]> {
  const [err, res] = await request({
    url: '/basic/api/file/catalog',
    params: {
      filename: '/music'
    }
  })
  if (err) return [];

  const config = {
    '.flac': '无损',
    '.mp3': '标准',
  }

  return res.data.map(item => {
    const [author, name] = item.name.replace(item.ext, '').split('-');

    return {
      ...item,
      name,
      author,
      type: config[item.ext] || '未知',
    }
  })
}