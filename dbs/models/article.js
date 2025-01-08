import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const editorSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    time: {
        type: String,
        require: true
    },
    user: {
        type: String,
        require: true
    },
    bg: {
        type: String,
        default: 'https://wx1.sinaimg.cn/mw690/9afd6f06gy1gct7zcioagj20p00irwiw.jpg'
    },
    // 文章被點擊的次數
    click: {
        type: Number,
        default: 1
    },
    // 邏輯刪除
    deleteFlag :{
        type:Boolean,
        default:false,
    },
    // 是否审核
    examine :{
        type:Boolean,
        default:false,
    }
})
export default mongoose.model('Article', editorSchema)