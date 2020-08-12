const Router = require('koa-router')

const {Favor} = require('../../models/favor')
const {Auth} = require('../../../middlewares/auth')
const { LikeValidator } = require('../../validators/validator')
const {success} = require('../../lib/helper')

const router = new Router({
    prefix: '/v1/like'
})

router.post('/', new Auth().m, async ctx =>{
    const v = await new LikeValidator().validate(ctx, {id: "art_id"})
    //linvalidator支持别名,在validate函数中可以传入2个参数，第二个参数就是支持别名
    await Favor.like(v.get('body.art_id'), v.get('body.type'), ctx.auth.uid)
    //A、B用户都有权限获取数据库数据，但是如果A用户串改uid号获取B用户的数据，就非常危险
    //解决方案就是不让前端把uid号当成参数进行传递，而是服务端自己从token令牌中来获取id号
    success()
})


router.post('/cancel', new Auth().m, async ctx =>{
    const v = await new LikeValidator().validate(ctx, {id: 'art_id'})
    await Favor.dislike(v.get('body.art_id'), v.get('body.type'), ctx.auth.uid)
    success()
})


module.exports = router