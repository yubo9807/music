import { h, useLayoutEffect, useRef, useState } from "pl-react";
import { api_getMusicList, MusicItem } from "./api/music";
import env from "~/config/env";
import style from './index.module.scss';
import Progress, { ProgressExpose } from "./components/Progress";
import { conversionTime, randomNum } from "./utils/number";

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
  useLayoutEffect(() => {
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
  const [proportion, setProportion] = useState({
    percent: 0,
    duration: 0,
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<ProgressExpose>();

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
    const { name, author, path } = list[index];
    document.title = name + ' - ' + author;

    const audioEl = document.createElement('audio');
    audioEl.preload = 'auto';
    audioEl.src = env.STATIC_BASE_URL + path;
    audioRef.current = audioEl;

    // 播放进度
    function onLoadedmetadata() {
      setProportion({ percent: 0, duration: audioEl.duration });
    }
    function onTimeupdate() {
      const { currentTime, duration } = audioEl;
      const percent = currentTime / duration;
      progressRef.current.setProgress(percent);
      setProportion({ percent: currentTime, duration });
    }

    // 预加载进度
    function onProgress() {
      const duration = audioEl.duration;
      const bufferedEnd = audioEl.buffered.end(audioEl.buffered.length - 1);
      progressRef.current.setLoad(bufferedEnd / duration);
    }

    // 当前歌曲播放结束
    const onEnded = index === list.length - 1 ? pause : next;

    audioEl.addEventListener('loadedmetadata', onLoadedmetadata);
    audioEl.addEventListener('progress', onProgress);
    audioEl.addEventListener('timeupdate', onTimeupdate);
    audioEl.addEventListener('ended', onEnded);
    return () => {
      audioEl.removeEventListener('loadedmetadata', onLoadedmetadata);
      audioEl.removeEventListener('timeupdate', onTimeupdate);
      audioEl.removeEventListener('progress', onProgress);
      audioEl.removeEventListener('ended', onEnded);
      audioEl.pause();
      audioEl.src = '';
      audioEl.remove();
      progressRef.current.setLoad(0);
      progressRef.current.setProgress(0);
    }
  }, [index]);

  // useLayoutEffect(() => {
  //   const { path } = list[index];
  //   const mediaSource = new MediaSource();
  //   audioRef.current.src = URL.createObjectURL(mediaSource);
  //   mediaSource.addEventListener('sourceopen', () => {
  //     const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
  //     const audioContext = new AudioContext();

  //     fetch(env.STATIC_BASE_URL + path).then(async res => {
  //       if (!res.ok) return;
  //       const reader = res.body.getReader();
  //       const contentLength = Number(res.headers.get('Content-Length'));
  //       mediaSource.duration = contentLength / 128000;
  //       let receivedLength = 0;
  //       const buffer = new Uint8Array(contentLength);
  //       let count = 0;
  //       while (1) {
  //         const { done, value } = await reader.read();
  //         if (done) {
  //           if (receivedLength === contentLength) break;
  //           const sliceBuffer = buffer.slice(count, contentLength);
  //           sourceBuffer.appendBuffer(sliceBuffer);
  //           break;
  //         }

  //         // 下载进度
  //         receivedLength += value.length;
  //         const percent = ((receivedLength / contentLength) * 100).toFixed(2);

  //         // 收集数据
  //         console.log(sourceBuffer.updating);
  //         buffer.set(value, receivedLength - value.length);
  //         if (sourceBuffer.updating) continue;

  //         const sliceBuffer = buffer.slice(count, receivedLength);
  //         sourceBuffer.appendBuffer(sliceBuffer);
  //         count = receivedLength;
  //         // console.log(`已加载: ${percent}%`);
  //       }
  //     })
  //   });
  // }, [index])

  /**
   * 进度条回调
   * @param num 
   */
  function progressChange(num: number) {
    const el = audioRef.current;
    el.currentTime = el.duration * num;
    if (status !== 'play') {
      play();
    }
  }

  const currentMusic = list[index];
  return <div className={style.container}>
    <ul className={style.list}>{...list.map((item, i) => <li className={i === index ? style.active : ''} onclick={() => {
      setIndex(i);
      setTimeout(play);
    }}>
      <strong className={[style.name, 'ellipsis']}>{item.name}</strong>
      <span className={style.ext}>{item.type}</span>
      <span className={[style.author, 'ellipsis']}>{item.author}</span>
    </li>)}
    </ul>

    <div className={style.wrapper}>
      {/* <audio ref={audioRef} controls preload="auto" /> */}
      <div className={style.header}>
        <div className={style.info}>
          <strong>{currentMusic.name}</strong>
          &nbsp;-&nbsp;
          <span className={style.author}>{currentMusic.author}</span>
        </div>
        <div className={style.other}>
          <span>{currentMusic.type}</span>
          <span>{conversionTime(proportion.percent)}/{conversionTime(proportion.duration)}</span>&nbsp;
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

