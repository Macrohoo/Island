const Router = require('koa-router')
const {TokenValidator, NotEmptyValidator} = require('../../validators/validator')
const {User} = require('../../models/user')
const {LoginType} = require('../../lib/enum')
const {generateToken} = require('../../../core/util')
const {Auth} = require('../../../middlewares/auth')
const {WXManager} = require('../../services/wx')

const router = new Router({
    prefix: '/v1/token'
})

router.post('/', async (ctx)=>{
    const v = await new TokenValidator().validate(ctx)
    // 根据不同的type进行验证 email和小程序登入不一样
    // 用switch和case语句
    let token ='';
    switch (v.get('body.type')) {
        case LoginType.USER_EMAIL:
            token = await emailLogin(v.get('body.account'), v.get('body.secret'))
            break;
        case LoginType.USER_MINI_PROGRAM:
            token = await WXManager.codeToToken(v.get('body.account'))
            break;
        default:
            // 默认情况下，如果登录方式不存在于enum中，就抛出异常
            throw new global.errs.ParameterException('没有相应的处理函数')
    }
    ctx.body = {
        token
    }
})

router.post('/verify', async (ctx)=>{
    //token
    const v = await new NotEmptyValidator().validate(ctx)
    const result = Auth.verifyToken(v.get('body.token'))
    ctx.body = {
        is_valide: result
    }
})

async function emailLogin(account,secret){
    const user = await User.verifyEmailPassword(account, secret)
    return token = generateToken(user.id, Auth.USER)

}


module.exports = router