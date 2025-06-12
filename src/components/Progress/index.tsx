import { h, useEffect, useImperativeHandle, useState } from "pl-react"
import style from './index.module.scss'
import { PropsType } from "pl-react/types";
import { RefItem } from "pl-react/hooks";

export type ProgressExpose = {
  setProgress(num: number): void
}
interface Props extends PropsType {
  onChange: (num: number) => void
  ref?: RefItem<ProgressExpose>
}
export default function(props: Props) {
  const [left, setLeft] = useState(0);
  function handleClick(e: PointerEvent) {
    const num = e.layerX / (e.target as HTMLElement).clientWidth;
    setProgress(num);
    props.onChange(num);
  }

  function setProgress(num: number) {
    setLeft(Number(num.toFixed(2)) * 100);
  }

  useImperativeHandle<ProgressExpose>(props.ref, () => {
    return {
      setProgress,
    }
  })

  return <div className={style.progress} style={`--left: ${left}%`} onclick={handleClick}>
    <div className={style.point}></div>
  </div>
}