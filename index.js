// const Koa = require('koa')
import Koa from 'koa';
const consola = require('consola');
//引入必要的模块
import mongoose from 'mongoose';
import bodyParser from 'koa-bodyparser';
import session from 'koa-generic-session';
import Redis from 'koa-redis';
import json from 'koa-json';
import koaStatic from 'koa-static';
import koajwt from 'koa-jwt';
import jwt from 'jsonwebtoken'
import dbConfig from './dbs/config';
import passport from './interface/utils/passport';
import users from './interface/users';
import article from './interface/article';
import comment from './interface/comment';
import picture from './interface/picture';
import verify from './common/jwtVerify';
// 错误异常处理
import errorHandler from './middleware/errorHandler';
// 登录验证处理
import isLoginHandle from './middleware/isLoginHandle';
import { jwtConfig } from './common/config';
import { resolveAuthorizationHeader } from './common/utils';
const app = new Koa();

async function start() {
  const host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000;

  //设定

  app.use(koaStatic(__dirname + '/static'));
  app.keys = ['aya', 'keys'];
  app.proxy = true;

  app.use(
    session({
      key: 'aya',
      prefix: 'aya:uid',
      store: new Redis(),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, //one day in ms,
      },
    })
  );

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
  /**
    * app.use(passport.initialize()) 会在请求周期ctx对象挂载以下方法与属性
    * ctx.state.user 认证用户
    * ctx.login(user) 登录用户（序列化用户）
    * ctx.isAuthenticated() 判断是否认证
*/
  //身份验证
  // app.use(passport.initialize());
  // app.use(passport.session());

  // 错误
  // app.use(errorHandler);
  // 登录验证
  // app.use(isLoginHandle);


  // 错误处理
  app.use((ctx, next) => {
    return next().catch((err) => {
      if (err.status === 401) {
        ctx.status = 401;
        ctx.body = 'Protected resource, use Authorization header to get access\n';
      } else {
        throw err;
      }
    })
  })

  // 鉴权 注意：放在路由前面
  app.use(async (ctx, next) => {
    // 检查请求路径是否以'/static/'开头（或根据你的实际静态资源路径调整）
    if (!ctx.path.startsWith('/uploads/')) {
      // 非静态资源路径，进行JWT验证
      await koajwt({
        secret: jwtConfig.tokenKey
      }).unless({ // 配置白名单
        path: jwtConfig.path
      })(ctx, next);
    } else {
      // 静态资源路径，直接放行
      await next();
    }

  })

  // 鉴权获取token的数据
  app.use(async (ctx, next) => {
    const authorization = resolveAuthorizationHeader(ctx.request.header.authorization)

    if (authorization) {
      const decodedToken = await verify(authorization, jwtConfig.tokenKey);
      ctx.state.user = decodedToken;  // 这里的key = 'user'
    }
    await next()
  })

  //路由
  app.use(users.routes()).use(users.allowedMethods());
  app.use(article.routes()).use(article.allowedMethods());
  app.use(comment.routes()).use(comment.allowedMethods());
  app.use(picture.routes()).use(picture.allowedMethods());


  app.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true,
  });
}

start();
