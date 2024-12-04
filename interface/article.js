import Router from '@koa/router';
import Article from '../dbs/models/article';
import sillyDatetime from 'silly-datetime';
import multer from '@koa/multer';
import { getPlainText, resDataOk } from '../common/utils';

const router = new Router({
  prefix: '/article',
});
const storage = multer.diskStorage({
  //文件保存路径
  destination(req, { originalname }, cb) {         //destination目的地，文件的存储的地方         
    cb(null, 'static/uploads/')                 //文件存储的路径
  },
  //修改文件名称
  filename(req, { originalname }, cb) {
    const ext = originalname.split('.').pop() //截取后缀
    cb(null, Date.now() + '.' + ext);
  },
});
const upload = multer({ storage }); // note you can pass `multer` options here

router.post('/image', upload.single('file'), async ctx => {
  ctx.body = {
    code: 0,
    msg: '上传成功',
    data: {
      // url: 'http://' + ctx.req.headers.host + '/uploads/' + ctx.req.file.filename
      url: '/uploads/' + ctx.file.filename,
    },
  };
});

router.post('/uploadarticle', async ctx => {
  const { title, content, bg } = ctx.request.body;
  let time = sillyDatetime.format(new Date(), 'YYYY-MM-DD HH:mm');
  let user = ctx.state.user.username;
  let article = new Article({
    time,
    user,
    title,
    content,
    bg,
  });
  let result = await article.save();
  if (result) {
    ctx.body = {
      code: 0,
      msg: '上传成功',
      data: true
    };
  }
});
router.post('/editArticle', async ctx => {
  const { title, content, bg, id } = ctx.request.body;
  let result = await Article.findOneAndUpdate({ _id: id }, { title, content, bg }, { new: true });
  if (result) {
    ctx.body = {
      code: 0,
      msg: '上传成功',
      data: true
    };
  }
});
router.post('/deleteArticle', async ctx => {
  const { title, content, bg, id } = ctx.request.body;
  let result = await Article.findOneAndUpdate({ _id: id }, { title, content, bg, deleteFlag: true }, { new: true });
  if (result) {
    ctx.body = {
      code: 0,
      msg: '删除成功',
      data: true
    };
  }
});
router.get('/getarticle', async ctx => {
  const result = await Article.find({ deleteFlag: false });
  ctx.body = resDataOk(result.map(item => {
    item.content = ''
    return item;
  }))
  //   let { page } = ctx.request.query;
  //   let start = (page - 1) * 10;
  //   let result = await Article.find({}, { content: 0 }).sort({ _id: -1 }).skip(start).limit(10);
  //   let count = await Article.countDocuments();
  //   if (result.length) {
  //     ctx.body = {
  //       code: 0,
  //       msg: '请求成功',
  //       data: {
  //         count,
  //         result,
  //       },
  //     };
  //   }
});
router.get('/myArticle', async ctx => {
  const { username } = ctx.state.user;
  let result = await Article.find({ user: username, deleteFlag: false }, { content: 0 }).sort({ _id: -1 }).limit(10);
  ctx.body = {
    code: 0,
    msg: '请求成功',
    data: result.map(item => {
       item.content = ''
      return item;
    }),
  };
});
router.get('/getarticleDetail', async ctx => {
  let req = ctx.request.query;
  let result = await Article.findByIdAndUpdate({ _id: req._id }, { $inc: { click: 1 } }, { new: true, upsert: true });
  if (result) {
    ctx.body = {
      code: 0,
      msg: '请求成功',
      data: result,
    };
  } else {
    ctx.body = {
      code: -1,
      msg: '不存在的文章',
      data: '',
    };
  }
});
router.get('/getSingleArticle', async ctx => {
  let { id } = ctx.request.query;
  let result = await Article.findOne({ _id: id });
  if (result) {
    ctx.body = {
      code: 0,
      msg: '请求成功',
      data: result,
    };
  } else {
    ctx.body = {
      code: -1,
      msg: '不存在的文章',
      data: '',
    };
  }
});

router.get('/recommend', async ctx => {
  // let count = await Article.countDocuments();
  // let arr = [];
  // let req = [];
  // let addRandom = function () {
  //   if (arr.length < 5) {
  //     let ramdonCount = random(0, count - 1);
  //     if (!arr.includes(ramdonCount)) {
  //       arr.push(ramdonCount);
  //     }
  //     addRandom();
  //   }
  // };
  // addRandom();
  // for (let i of arr) {
  //   let result = await Article.findOne({}, { content: 0, bg: 0 }).skip(i);
  //   req.push(result);
  // }
  ctx.body = {
    code: 0,
    msg: '请求成功',
    // data: req,
    data: []
  };
});

function random(n, m) {
  return Math.round(Math.random() * (m - n) + n);
}

export default router;
