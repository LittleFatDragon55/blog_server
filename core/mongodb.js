const mongoose = require("mongoose")
const autoIncrement = require("mongoose-auto-increment")

mongoose.set("useFindAndModify", false)

mongoose.Promise = global.Promise

exports.mongoose = mongoose

exports.connect = () => {
    mongoose.connect("mongodb://localhost:27017/blogdb", {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        promiseLibrary: global.Promise
    })

    mongoose.connection.on("error", error => {
        console.log("数据库连接失败", error)
    })

    mongoose.connection.once("open", () => {
        console.log("连接成功")
    })

    autoIncrement.initialize(mongoose.connection)
    return mongoose
}