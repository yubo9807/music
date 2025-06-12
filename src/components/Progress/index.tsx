import { h, useImperativeHandle, useRef, useState } from "pl-react"
import style from './index.module.scss'
import { PropsType } from "pl-react/types";
import { RefItem } from "pl-react/hooks";

export type ProgressExpose = {
  setLoad(num: number): void
  setProgress(num: number): void
}
interface Props extends PropsType {
  onChange(num: number): void
  ref?: RefItem<ProgressExpose>
}
export default function(props: Props) {
  const [load, setLoad] = useState(0);
  const [left, setLeft] = useState(0);
  const [isMove, setIsMove] = useState(true);

  function setProgress(num: number) {
    setLeft(Number((num * 100).toFixed(2)));
  }

  useImperativeHandle<ProgressExpose>(props.ref, () => {
    return {
      setLoad(num: number) {
        setLoad(Number((num * 100).toFixed(2)));
      },
      setProgress(num: number) {
        if (isMove) setProgress(num);
      }
    }
  })

  const wrapRef = useRef<HTMLDivElement>();
  const pointRef = useRef<HTMLDivElement>();

  function handleClick(e: PointerEvent) {
    if (e.target === pointRef.current) return;
    const num = e.layerX / (e.target as HTMLElement).clientWidth;
    setProgress(num);
    props.onChange(num);
  }

  function mouseDown(e: MouseEvent) {
    setIsMove(false);
    const mouseMove = (e: MouseEvent) => {
      const num = (e.clientX - pointRef.current.clientWidth * 2) / wrapRef.current.clientWidth;
      setProgress(num);
    };
    function mouseUp() {
      setIsMove(true);
      const num = pointRef.current.offsetLeft / wrapRef.current.clientWidth;
      props.onChange(num);
      document.removeEventListener('mousemove', mouseMove, false);
      document.removeEventListener('mouseup', mouseUp, false);
    }
    document.addEventListener('mousemove', mouseMove, false);
    document.addEventListener('mouseup', mouseUp, false);
  }

  function touchstart(e: TouchEvent) {
    setIsMove(false);
    const touchMove = (e: TouchEvent) => {
      const num = (e.touches[0].clientX - pointRef.current.clientWidth * 2) / wrapRef.current.clientWidth;
      setProgress(num);
    };
    function touchend() {
      setIsMove(true);
      const num = pointRef.current.offsetLeft / wrapRef.current.clientWidth;
      props.onChange(num);
      document.removeEventListener('touchmove', touchMove, false);
      document.removeEventListener('touchend', touchend, false);
    }
    document.addEventListener('touchmove', touchMove, false);
    document.addEventListener('touchend', touchend, false);
  }

  return <div ref={wrapRef} className={style.progress} style={`--load: ${load}%; --left: ${left}%;`} onclick={handleClick}>
    <div ref={pointRef} className={style.point} onmousedown={mouseDown} ontouchstart={touchstart}></div>
  </div>
}