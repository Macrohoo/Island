const {Sequelize, Model} = require('sequelize')
const util = require('util')
const axios = require('axios')
const {sequelize} = require('../../core/db')
const { Favor } = require('./favor')


class Book extends Model{
    //以后不要在Model上定义构造函数,这里可以把id写在实例里:async detail(id){ }
    async detail(id){
        const url = util.format(global.config.yushu.detailUrl, id)
        const deatil = await axios.get(url)
        return deatil.data
    }

    static async getMyFavorBookCount(uid){
        //Fovor.count是sequelize在数据上挂载的只求数量的方法,返回的是一个数字
        const count = await Favor.count({
            where:{
                type: 400,
                uid
            }
        })
        return count
    }

    //summary=1表示显示概要信息
    static async searchFromYuShu(q, start, count, summary=1){
        const url = util.format(global.config.yushu.keywordUrl, encodeURI(q), count, start, summary)
        const results = await axios.get(url)
        return results.data
    }
}

Book.init({
    id:{
        type: Sequelize.INTEGER,
        primaryKey:true
    },
    fav_nums: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
},{
    sequelize,
    tableName: 'book'
})

module.exports = {
    Book
}