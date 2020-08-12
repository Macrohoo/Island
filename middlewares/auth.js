const basicAuth = require('basic-auth')  //解析token的包
//这里身份验证机制用HttpBasicAuth这种方式
const jwt =require('jsonwebtoken')

class Auth {
    constructor(level){
        this.level = level || 1
        //下面定义类变量
        Auth.USER = 8
        Auth.ADMIN = 16
        Auth.SUPER_ADMIN = 32

    }
    // get语法将对象属性绑定到查询该属性时将被调用的函数
    get m(){
        return async (ctx, next)=>{
            const userToken = basicAuth(ctx.req) //ctx.request基于koa的request
            let errMsg = 'token不合法'

            if(!userToken || !userToken.name){
                throw new global.errs.Forbbiden(errMsg)
            }
            try {
                var decode = jwt.verify(userToken.name, global.config.security.secretKey)
            } catch (error) {
                // token不合法，token过期两种情况
                if(error.name === 'TokenExpiredError'){
                    errMsg = 'token已过期'
                }
                throw new global.errs.Forbbiden(errMsg)
            }

            if(decode.scope < this.level){
                errMsg = '权限不足'
                throw new global.errs.Forbbiden(errMsg)
            }
            //uid scope
            ctx.auth = {
                uid: decode.uid,
                scope: decode.scope
            }
            await next()
        }
    }
    //编写一个静态验证令牌的方法
    static verifyToken(token){
        try {
            jwt.verify(token, global.config.security.secretKey)
            return true
        } catch (error) {
            return false
        }
    }
}

module.exports = {
    Auth
}