import Router from '@koa/router'
import Redis from 'koa-redis'
import nodeMailer from 'nodemailer'
import User from '../dbs/models/users'
import Passport from './utils/passport'
import Email from '../dbs/config'
import axios from './utils/axios'
import jwt from 'jsonwebtoken'
import { jwtConfig } from '../common/config'
import sillyDatetime from 'silly-datetime'
import { resMsgFailed, resDataOk, resOk } from '../common/utils'
let router = new Router({
    prefix: '/users'
})

let Store = new Redis().client


router.post('/signup', async ctx => {
    const { username, password, email, code } = ctx.request.body;
    if (code) {
        const saveCode = await Store.hget(`nodemail:${username}`, `code`);

        const saveExpire = await Store.hget(`nodemail:${username}`, 'expire');
        if (code === saveCode) {
            if (new Date().getTime - saveExpire > 0) {
                ctx.body = {
                    code: -1,
                    msg: '验证码已经过期，请重试'
                }
                return false;
            }
        } else {
            ctx.body = {
                code: -1,
                msg: '请填写正确的验证码'
            }
            return false;
        }
    } else {
        ctx.body = {
            code: -1,
            msg: "请填写验证码"
        };
        return false;
    }
    let user = await User.find({ username });
    if (user.length) {
        ctx.body = {
            code: -1,
            msg: "用户名已经被注册"
        };
        return false;
    }
    // let e_mail = await User.find({ email });
    // if (e_mail.length) {
    //     ctx.body = {
    //         code: -1,
    //         msg: "邮箱已经被注册"
    //     };
    //     return false;
    // }
    let newUser = await User.create({
        username, password, email
    });
    if (newUser) {
        let res = await axios.post('/users/signin', { username, password })
        if (res.data.code === 0) {
            ctx.body = {
                code: 0,
                msg: "注册成功",
                user: res.data.user
            };
        } else {
            ctx.body = {
                code: -1,
                msg: "error"
            };
        }
    } else {
        ctx.body = {
            code: -1,
            msg: "注册失败"
        };
    }

})

//用户登录新
router.post('/signin', async (ctx, next) => {
    const data = ctx.request.body;
    if (!data.username || !data.password) {
        return ctx.body = {
            code: "-1",
            msg: "参数不合法"
        }
    }
    const result = await User.findOne({ username: data.username, password: data.password });
    // const result = userList.find(item => item.username === data.username && item.password === crypto.createHash('md5').update(data.password).digest('hex'))
    if (result) {
        const token = jwt.sign(
            {
                id: result._id,
                username: result.username,
                avatar: result.avatar,
                time: sillyDatetime.format(new Date(), "YYYY-MM-DD HH:mm")
            },
            jwtConfig.tokenKey, // secret
            { expiresIn: '144h' } // 60 * 60 s
        );
        return ctx.body = resOk({ msg: `登录成功`, data: token })
    } else {
        return ctx.body = resMsgFailed('用户名或密码错误')
    }
})
router.post("/changePass", async ctx => {
    let { username, email, password, code } = ctx.request.body;
    if (code) {
        const saveCode = await Store.hget(`nodemail:${username}`, "code");
        if (code == saveCode) {
            let result = await User.findOneAndUpdate({ username }, { password }, { 'new': true });
            if (result) {
                return ctx.body = resOk({ msg: `修改成功`, })
            }

        } else {
            return ctx.body = resMsgFailed('验证码错误')
        }
    } else {
        return ctx.body = resMsgFailed('验证码不存在')
    }
})

router.post("/verify", async (ctx, next) => {
    let username = ctx.request.body.username;
    let userEmail = ctx.request.body.email;
    let ifUser = await User.find({ username });
    if (ifUser.length) {
        ctx.body = {
            code: -1,
            msg: "用户名已经被注册"
        };
        return false;
    }
    const saveExpire = await Store.hget(`nodemail:${username}`, "expire");
    if (saveExpire && new Date().getTime - saveExpire < 0) {
        ctx.body = {
            code: -1,
            msg: "验证请求过于频繁，一分钟一次"
        };
        return false;
    }
    let transporter = nodeMailer.createTransport({
        service: 'qq',
        auth: {
            user: Email.smtp.user,
            pass: Email.smtp.pass
        }
    });
    let ko = {
        code: Email.smtp.code(),
        expire: Email.smtp.expire(),
        email: userEmail,
        user: username
    };

    let mailOption = {
        from: `"认证邮件"<${Email.smtp.user}>`,
        to: ko.email,
        subject: "<ayanami的狗窝>",
        html: `欢迎您的注册，可以再窝里面畅所欲言，验证码是${ko.code}，有效期5分钟，请及时填写`
    };
    let errMsg = null
    await transporter.sendMail(mailOption, (err, info) => {
        if (err) {
            return console.log("发送注册邮件失败,原因:" + err);
        } else {
            Store.hmset(
                `nodemail:${ko.user}`,
                "code",
                ko.code,
                "expire",
                ko.expire,
                "email",
                ko.email
            );
        }
    });
    if (errMsg) {
        return ctx.body = {
            code: 0,
            msg: "发送注册邮件失败,原因:" + errMsg
        };
    }
    return ctx.body = {
        code: 0,
        msg: "验证码已发送，有效期5分钟"
    };
});

router.get("/exit", async (ctx, next) => {
    await ctx.logout();
    if (!ctx.isAuthenticated()) {
        ctx.body = {
            code: 0,
            msg: '您已退出登录'
        };
    } else {
        ctx.body = {
            code: -1,
            msg: '操作失败！'
        };
    }
});

router.get("/getUser", async (ctx, next) => {
    // const res = await User.findOne({ _id: ctx.state.user._id })
    ctx.body = resDataOk(ctx.state.user)
});

export default router;