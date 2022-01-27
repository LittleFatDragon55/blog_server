import crypto from "crypto";
// const crypto = require('crypto');

module.exports = {
    md5: function (pwd) {
        let md5 = crypto.createHash("md5");
        return md5.update(pwd).digest("hex")
    },
    responseClient(res, httpCode = 500, code = 3, message = '服务端异常', data = {}, total = 0) {
        let responseData = {};
        responseData.code = code;
        responseData.message = message;
        if (data) {
            responseData.data = data;
        }
        if (total) {
            responseData.total = total
        }
        res.status(httpCode).json(responseData);
    },
}