// const Koa = require('koa')
import Koa from 'koa';
const consola = require('consola');
//引入必要的模块
import mongoose from 'mongoose';
import bodyParser from 'koa-bodyparser';
import session from 'koa-generic-session';
// import Redis from 'koa-redis';
import json from 'koa-json';
import koaStatic from 'koa-static';
import dbConfig from './dbs/config';
import passport from './interface/utils/passport';
import users from './interface/users';
import article from './interface/article';
import comment from './interface/comment';
import picture from './interface/picture';
// 错误异常处理
import errorHandler from './middleware/errorHandler';
// 登录验证处理
import isLoginHandle from './middleware/isLoginHandle';
const app = new Koa();

// Import and Set Nuxt.js options

async function start() {
  const host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000;

  //设定

  app.use(koaStatic(__dirname + './static'));
  app.keys = ['aya', 'keys'];
  app.proxy = true;
  // app.use(
  //   session({
  //     key: 'aya',
  //     prefix: 'aya:uid',
  //     store: new Redis(),
  //     cookie: {
  //       maxAge: 24 * 60 * 60 * 1000, //one day in ms,
  //     },
  //   })
  // );
  app.use(
    bodyParser({
      extendTypes: ['json', 'form', 'text'],
    })
  );
  app.use(json());
  //连接数据库
  // 升级了koa的版本，很多原来的配置无需操作
  //DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead
  // mongoose.set('useCreateIndex', true);
  //Mongoose: `findOneAndUpdate()` and `findOneAndDelete()` without the `useFindAndModify` option set to false are deprecated.
  // mongoose.set('useFindAndModify', false);
  mongoose.connect(dbConfig.dbs, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  });
  //身份验证
  app.use(passport.initialize());
  app.use(passport.session());

  // 错误
  // app.use(errorHandler);
  // 登录验证
  // app.use(isLoginHandle);

  //路由
  app.use(users.routes()).use(users.allowedMethods());
  app.use(article.routes()).use(article.allowedMethods());
  app.use(comment.routes()).use(comment.allowedMethods());
  app.use(picture.routes()).use(picture.allowedMethods());
  //=============
  // app.use(ctx => {
  //   ctx.status = 200;
  //   ctx.respond = false; // Bypass Koa's built-in response handling
  //   ctx.req.ctx = ctx; // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
  //   nuxt.render(ctx.req, ctx.res);status
  // });

  app.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true,
  });
}

start();
