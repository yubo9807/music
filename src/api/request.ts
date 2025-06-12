import { asyncto } from "../utils/async";
import env from "~/config/env";

interface Option extends RequestInit {
  url: string
  params?: Record<string, string>
}
export function fetchRequest(option: Option) {
  const { url, params, ...args } = option;
  const newUrl = env.API_BASE_URL + (params ? `${url}?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}` : url);
  return new Promise((resolve, reject) => {
    fetch(newUrl, args).then(res => {
      if (res.ok) {
        resolve(res.json())
      } else {
        reject(res);
      }
    }).catch(err => {
      reject(err);
    })
  })
}

export default function request(option: Option) {
  return asyncto(fetchRequest(option));
}