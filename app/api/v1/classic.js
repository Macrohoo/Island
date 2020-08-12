const Router = require('koa-router')

const {Flow} = require('../../models/flow')
const {Art} = require('../../models/art')
const {Auth} = require('../../../middlewares/auth')
const {Favor} = require('../../models/favor')
const {PositiveIntegerValidator, ClassicValidator} = require('../../validators/validator')

const router = new Router({
    prefix: '/v1/classic'
})




router.get('/latest', new Auth().m,  async (ctx, next) =>{
    //m不是一个方法而是一个属性，所以不需要加括号，这里加入一个Auth中间件，对路径访问设置权限
    const flow = await Flow.findOne({
        order:[
            ['index', 'DESC']
        ]
    })
    const favor = await Favor.userLikeIt(flow.art_id, flow.type, ctx.auth.uid)
    const art = await Art.getData(flow.art_id, flow.type)
    //序列化对象变json，把Art序列化的时候不可能去序列化Art这个类，我们只需要去序列化Art下面的dataValues这个字段
    art.setDataValue('index', flow.index)
    art.setDataValue('like_status', favor);
    ctx.body = art
})


router.get('/:index/next', new Auth().m, async(ctx, next)=>{
    const v = await new PositiveIntegerValidator().validate(ctx, {
        id: 'index'
    })
    const index = v.get('path.index')
    const flow = await Flow.findOne({
        where:{
            index: index + 1
        }
    })
    if(!flow){
        throw new global.errs.NotFound('没有找到下一个期刊')
    }
    const art = await Art.getData(flow.art_id, flow.type)
    const favor = await Favor.userLikeIt(flow.art_id, flow.type, ctx.auth.uid)
    art.setDataValue('index', flow.index)
    art.setDataValue('like_status', favor)
    ctx.body = art
})


router.get('/:index/previous', new Auth().m, async(ctx, next)=>{
    const v = await new PositiveIntegerValidator().validate(ctx, {
        id: 'index'
    })
    const index = v.get('path.index')
    const flow = await Flow.findOne({
        where:{
            index: index - 1
        }
    })
    if(!flow){
        throw new global.errs.NotFound('没有找到上一期期刊')
    }
    const art = await Art.getData(flow.art_id, flow.type)
    const favor = await Favor.userLikeIt(flow.art_id, flow.type, ctx.auth.uid)
    art.setDataValue('index', flow.index)
    art.setDataValue('like_status', favor)
    ctx.body = art
})


router.get('/:type/:id/favor', new Auth().m, async(ctx, next)=>{
    const v = await new ClassicValidator().validate(ctx)
    const id = v.get('path.id')
    //由于validator校验器必须传入int类型的type，所以这里必须转换
    const type = parseInt(v.get('path.type'))

    const art = await Art.getData(id, type)
    if(!art){
        throw new global.errs.NotFound()
    }
    const favor = await Favor.userLikeIt(id, type, ctx.auth.uid)
    ctx.body = {
        fav_nums: art.fav_nums,
        like_status: favor
    }
})


router.get('/favor', new Auth().m, async(ctx, next)=>{
    const uid = ctx.auth.uid
    ctx.body = await Favor.getMyClassicFavors(uid)
})


router.get('/:type/:id', new Auth().m, async (ctx, next)=>{
    const v = await new ClassicValidator().validate(ctx)
    const id = v.get('path.id')
    const type = parseInt(v.get('path.type'))

    //这里接口就用面向对象的方式编写，实例化Art
    //我们一般用纯静态的类编程，是面向过程的编程思想，我们需要培养面向对象的编程思想
    //如果一个类下面有好几十个静态方法，每个静态方法的调用都要接收大量的参数
    //但如果用实例方法来处理这个类的话，很多描述这个类特征的一些参数是可以通过constructor构造函数传递进来，这样就避免了在静态方法里面重复的去传参数，静态方法不太具有复用性。
    const artDetail =await new Art(id, type).getDetail(ctx.auth.uid)
    artDetail.art.setDataValue('like_status', artDetail.like_status)
    ctx.body = artDetail.art
})




module.exports = router