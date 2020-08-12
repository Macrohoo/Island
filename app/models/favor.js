const {Sequelize, Model, Op} = require('sequelize')
const {sequelize} = require('../../core/db')
const {Art} = require('../models/art')


class Favor extends Model{
    //业务表
    static async like(art_id, type, uid){
        //1往favor表里添加记录 2往classic下面的fav_nums添加数据
        const favor = await Favor.findOne({
            where:{
                art_id,
                type,
                uid
            }
        })
        if(favor){
            throw new global.errs.LikeError()
        }
        //这里用到sequelize的事务，sql中事务是为了保证数据写入的时候一致性，保证多条语句要么同时成功或者失败
        return sequelize.transaction(async t=>{
            await Favor.create({
                art_id,
                type,
                uid
            }, {transaction: t})
            const art = await Art.getData(art_id, type, false)
            //调用Art模型中的getData方法确定用户到底点赞的是哪个期刊，art.increment进行加一操作
            //by:1表示加一，并注意书屋transaction：t的位置
            await art.increment('fav_nums', {by: 1, transaction: t})
        })
    }

    static async dislike(art_id, type, uid){
        //1往favor表里添加记录 2往classic下面的fav_nums添加数据
        const favor = await Favor.findOne({
            where:{
                art_id,
                type,
                uid
            }
        })
        if(!favor){
            throw new global.errs.DislikeError()
        }
        //这里用到sequelize的事务，sql中事务是为了保证数据写入的时候一致性，保证多条语句要么同时成功或者失败
        return sequelize.transaction(async t=>{
            await favor.destroy({
                //force是物理删除还是软删除的判定
                force:true,
                transaction: t
            })
            const art = await Art.getData(art_id, type, false)
            //调用Art模型中的getData方法确定用户到底点赞的是哪个期刊，art.increment进行加一操作
            //by:1表示加一，并注意书屋transaction：t的位置
            await art.decrement('fav_nums', {by: 1, transaction: t})
        })
    }

    static async userLikeIt(art_id, type, uid) {
        const favor = await Favor.findOne({
          where: {
            art_id,
            type,
            uid,
          }
        })
        if (favor) {
          return true;
        }
        else {
          return false;
        }
    }

    static async getMyClassicFavors(uid){
        const arts = await Favor.findAll({
            where:{
                uid,
                //type Op.not是sequelize提供的一组方法，表示type不是400
                type:{
                    [Op.not]:400,
                    //[]表示字符串，这里是字符串的意思，其他时候[]里面的内容也可以是表达式，表达前面被定义的变量
                }
            }
        })
        if(!arts){
            throw new global.errs.NotFound()
        }
        //不能在数据库中使用for查询，因为for查询不可控，只能用in查询，把方法写到Art中去
        return await Art.getList(arts)
    }

    static async getBookFavor(uid, bookID){
        const favorNums = await Favor.count({
            where:{
                art_id: bookID,
                type: 400
            }
        })
        const myFavor = await Favor.findOne({
            where:{
                art_id: bookID,
                uid,
                type: 400
            }
        })
        return {
            fav_nums: favorNums,
            like_status: myFavor? 1:0
        }
    }

}

Favor.init({
    uid: Sequelize.INTEGER,
    art_id: Sequelize.INTEGER,
    type: Sequelize.INTEGER
},{
   sequelize,
   tableName: 'favor' 
})


module.exports = {
    Favor
}