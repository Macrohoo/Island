const util = require('util')
const axios = require('axios')
const {User} = require('../models/user')
const {generateToken} = require('../../core/util')
const {Auth} = require('../../middlewares/auth')

class WXManager{

    static async codeToToken(code){
        //微信小程序微信服务端接口url发回的openid是唯一标识坚定用户是否合法
        //需要用code appid appsecret  这三个数据去微信服务端换取用户的openid
        const url = util.format(global.config.wx.loginUrl, global.config.wx.appId, global.config.wx.appSecret, code)
        const result = await axios.get(url)
        if(result.status !== 200){
            throw new global.errs.AuthFailed('openid获取失败')
        }
        const errcode = result.data.errcode
        const errmsg = result.data.errmsg
        if(errcode){
            throw new global.errs.AuthFailed('openid获取失败:'+ errmsg)
        }
        let user = await User.getUserByOpenid(result.data.openid)
        //这里的user不是常量，下面判断user会变，用let定义不能用const
        if(!user){
            user = await User.registerByOpenid(result.data.openid)
        }
        return generateToken(user.id, Auth.USER)
    }
}

module.exports = {
    WXManager
}