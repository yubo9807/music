/**
 * 请求函数封装，以数组形式返回
 * @param promise 请求函数
 * @returns [err, res] 通常情况下只有一项为 null
 */
export function asyncto(promise: Promise<any>) {
  return promise
    .then(data => [ null, data ])
    .catch(err => [ err, null ]);
}
