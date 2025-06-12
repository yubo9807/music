
import { createApp, h } from 'pl-react';
import './styles/index.scss'

import App from './app';
const root = document.getElementById("root");
const app = createApp();
app.render(<App />, root);
