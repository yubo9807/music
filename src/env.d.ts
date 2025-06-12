import { IntrinsicElements as PlIntrinsicElements } from 'pl-react/jsx';

declare global {
  namespace JSX {
    interface IntrinsicElements extends PlIntrinsicElements {}
  }
}
