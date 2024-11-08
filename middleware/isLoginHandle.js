// 登录验证处理
export default async (ctx, next) => {
  next();
  // 白名单设置,通过的接口不需要进行登录验证
  // const whiteList = ['/login', '/article/getarticle', '/users/signin','/users/verify'];
  // const result = whiteList.some(item => item === ctx.url);
  // if (result) {
  //   await next();
  //   return;
  // } else {
  //   return (ctx.body = {
  //     code: 0,
  //     msg: '请先登录',
  //   });
  // }
};
