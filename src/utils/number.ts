/**
 * 计算字节大小
 * @param {*} num
 * @param {*} utils
 * @returns
 */
export function calculateByte(num = 0, utils = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB', 'NB', 'DB', 'CB', 'EB', 'ZB', 'YB', 'BB']) {
  const len = utils.length;
  let str = '';
  if (num < 1024) str = num + utils[0];
  for (let i = 1; i < len; i++) {
    if (num > 1024 ** i) str = (num / (1024 ** i)).toFixed(2) + utils[i];
  }
  return str;
}

/**
 * 生成随机数（只可取正整数）
 * @param max 最大值（取不到）
 * @param min 最小值
 */
export function randomNum(max: number, min: number = 0) {
  return ~~(Math.random() * (max - min) + min);
}