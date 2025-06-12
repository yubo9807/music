
import { createApp, h, useLayoutEffect } from 'pl-react';
import './styles/index.scss'

import App from './app';
const root = document.getElementById("root");
const app = createApp();

function Main() {

  useLayoutEffect(() => {
    const prefers = matchMedia('(prefers-color-scheme: dark)');
    followOS();
    function followOS() {
      document.documentElement.dataset.theme = prefers.matches ? 'dark' : 'light';
    }
    prefers.addEventListener('change', followOS);
    return () => {
      prefers.removeEventListener('change', followOS);
    }
  }, [])

  return <App />
}
app.render(<Main />, root);
