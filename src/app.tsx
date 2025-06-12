import { h, useEffect, useLayoutEffect, useRef, useState } from "pl-react";
import { api_getMusicList, MusicItem } from "./api/music";
import env from "~/config/env";
import style from './index.module.scss';
import Progress, { ProgressExpose } from "./components/Progress";
import { calculateByte, randomNum } from "./utils/number";

const MUSIC_INDEX = '_music_index_';
const MUSIC_MODE = '_music_mode_';
const MODE_LIST = ['loop', 'random', 'single'];
const ModeConfig = {
  loop: '⥧',
  random: '↬',
  single: '⤼'
} 
export default function App() {
  const [list, setList] = useState<MusicItem[]>([]);
  useEffect(() => {
    api_getMusicList().then(res => {
      setList(res);
    })
  }, []);

  if (list.length === 0) return <div>loading...</div>


  // 播放模式
  const [mode, setMode] = useState<typeof MODE_LIST[number]>(localStorage.getItem(MUSIC_MODE) as 'loop' || 'loop');
  function changeMode() {
    const index = MODE_LIST.indexOf(mode);
    const newMode = MODE_LIST[(index + 1) % MODE_LIST.length];
    setMode(newMode);
    localStorage.setItem(MUSIC_MODE, newMode);
  }

  const [index, setIndex2] = useState(Number(localStorage.getItem(MUSIC_INDEX)) || 0);
  function setIndex(value: number) {
    let newValue = value;
    if (mode === 'random') {
      newValue = randomNum(list.length);
    } else if (mode === 'single') {
      newValue = index;
    }
    setIndex2(newValue);
    localStorage.setItem(MUSIC_INDEX, newValue + '');
  }

  const [status, setStatus] = useState<'stop' | 'play' | 'pause'>('stop');
  const audioRef = useRef<HTMLAudioElement>(null);

  /**
   * 播放
   */
  function play() {
    setStatus('play');
    setTimeout(() => {
      audioRef.current.play()
    });
  }
  /**
   * 暂停
   */
  function pause() {
    setStatus('pause');
    audioRef.current.pause();
  }
  /**
   * 播放/暂停
   */
  function toggle() {
    if (status === 'play') {
      pause();
    } else {
      play();
    }
  }

  /**
   * 下一首
   */
  function next() {
    setIndex((index + 1) % list.length);
    play();
  }
  /**
   * 上一首
   */
  function prev() {
    setIndex((index - 1 + list.length) % list.length);
    play();
  }

  useLayoutEffect(() => {
    const { name, author } = list[index];
    document.title = name + ' - ' + author;

    // 当前歌曲播放结束
    const onEnded = index === list.length - 1 ? pause : next;
    audioRef.current.addEventListener('ended', onEnded);
    return () => {
      audioRef.current.removeEventListener('ended', onEnded);
    }
  }, [index]);

  const progressRef = useRef<ProgressExpose>();
  useLayoutEffect(() => {
    if (status !== 'play') return;
    const el = audioRef.current;
    const timer = setInterval(() => {
      const num = el.currentTime / el.duration;
      progressRef.current.setProgress(num);
    }, 800);
    return () => {
      clearInterval(timer);
    }
  }, [status])

  /**
   * 进度条回调
   * @param num 
   */
  function progressChange(num: number) {
    const el = audioRef.current;
    el.currentTime = el.duration * num;
  }

  const currentMusic = list[index];
  return <div>
    <ul className={style.list}>{...list.map((item, i) => <li onclick={() => {
        setIndex(i);
        setTimeout(play);
      }}>
        <strong className={[style.name, 'ellipsis']}>{item.name}</strong>
        <span className={style.ext}>{item.type}</span>
        <span className={[style.author, 'ellipsis']}>{item.author}</span>
      </li>)}
    </ul>

    <div className={style.container}>
      <audio ref={audioRef} src={env.STATIC_BASE_URL + currentMusic.path} controls />
      <div className={style.header}>
        <div className={style.info}>
          <strong>{currentMusic.name}</strong>
          &nbsp;-&nbsp;
          <span className={style.author}>{currentMusic.author}</span>
        </div>
        <div className={style.other}>
          <span className={style.type}>{currentMusic.type}</span>&nbsp;
          <span className={style.size}>{calculateByte(currentMusic.size)}</span>
        </div>
      </div>
      <Progress ref={progressRef} onChange={progressChange} />
      <div className={style.btns}>
        <span onclick={changeMode}>{ModeConfig[mode]}</span>
        <span onclick={() => prev()}>≪</span>
        <span onclick={() => toggle()}>{status === 'play' ? '☐' : '▸'}</span>
        <span onclick={() => next()}>≫</span>
      </div>
    </div>
  </div>
}

