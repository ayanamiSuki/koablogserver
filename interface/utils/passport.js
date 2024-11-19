import passport from "koa-passport";
import LocalStrategy from "passport-local";
import UserModel from "../../dbs/models/users";

passport.use(
    new LocalStrategy(async function (username, password, done) {
        let result = await UserModel.findOne({ username });
        if (result != null) {
            if (result.password === password) {
                return done(null, result);
            } else {
                return done(null, false, "密码错误");
            }
        } else {
            return done(null, false, "用户不存在");
        }
    })
);
// 序列化ctx.login()触发
passport.serializeUser(function (user, done) {
    done(null, user);
});
// 反序列化（请求时，session中存在"passport":{"user":"1"}触发）
passport.deserializeUser(function (user, done) {
    return done(null, user);
});

export default passport;
