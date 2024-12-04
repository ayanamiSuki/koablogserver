import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    avatar: {
        type: String,
        default: 'https://github.githubassets.com/assets/mona-loading-default-c3c7aad1282f.gif'
    }
})


export default mongoose.model("Users", UserSchema);