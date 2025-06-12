
const NODE_ENV = process.env.NODE_ENV as 'development' | 'production';

export default Object.freeze({

  BASE_URL: '/music',

  NODE_ENV,

  API_BASE_URL: NODE_ENV === 'development' ? '/trail' : 'http://trail.hpyyb.cn/trail',

  STATIC_BASE_URL: 'http://static.hpyyb.cn',

})
