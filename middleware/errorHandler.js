// 错误验证处理
export default async (ctx, next) => {
  let status = 0;
  try {
    await next();
    status = ctx.status;
    console.log('status', status);
  } catch (err) {
    console.log(err);
    status = 500;
  }
  if (status >= 400) {
    ctx.response.status = status;
    ctx.body = {
      code: status,
      result: ctx.url,
      msg: '接口请求失败',
    };
  }
};
