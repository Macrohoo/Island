
const Router = require('koa-router')
const {RegisterValidator} = require('../../validators/validator')
const {User} = require('../../models/user')

const router = new Router({
    prefix: '/v1/user'
})

//注册 新增数据

router.post('/register', async(ctx)=>{
    const v = await new RegisterValidator().validate(ctx)
    // 以前都是seesion的方式登录，但需要考虑状态。现在都是token，讲究无状态REST
    // token是无意义的随机字符串，jwt是可以携带数据的，比如我们经常把用户的id号放入jwt令牌中
    // 无论用户如何登录都是转化成对令牌的获取，所以我们需要编写一个接口来颁布令牌
    const user = {
        email: v.get('body.email'),
        password: v.get('body.password2'),
        nickname: v.get('body.nickname')
    }
    await User.create(user)
    throw new global.errs.Success()

})


module.exports = router