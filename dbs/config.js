const dbConfig = {
  dbs: 'mongodb://127.0.0.1:27017/bdServer',
  redis: {
    get host() {
      return '127.0.0.1';
    },
    get port() {
      return '6379';
    },
  },
  smtp: {
    //验证码
    get code() {
      return () => {
        return Math.random().toString(16).slice(2, 6).toUpperCase();
      };
    },
    get expire() {
      return () => {
        return new Date().getTime() + 60 * 60 * 1000 * 5;
      };
    },
  },
};
export default dbConfig;
