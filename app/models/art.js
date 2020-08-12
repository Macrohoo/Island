const {Op} = require('sequelize')
const {flatten} = require('loadsh')
const {Movie, Sentence, Music} = require('../models/classic')


class Art{
    //静态方法一般通过方法来传递参数，可实例化一个对象的话，一般对象的特征是通过构造函数传递到对象中的
    //这里传了art_id, type后Art就被唯一确定了
    constructor(art_id, type){
        this.art_id = art_id
        this.type = type
    }
    //用实例方法或者属性操作get detail(){}  ,一般面向对象的写法用属性操作这种，但是这里实例化以后需要传参uid
    //所以用了实例方法getDetail(){}
    async getDetail(uid){
        const {Favor} = require('../models/favor')
        const art = await Art.getData(this.art_id, this.type)
        if(!art){
            throw new global.errs.NotFound()
        }
        const favor = await Favor.userLikeIt(this.art_id, this.type, uid)
        return {
            art,
            like_status: favor
        }
    }

    static async getList(artInfoList){
        //用in查询方式，3个arts 3次in查询,我们一般都不会对数据库职别遍历查询,会影响性能
        const artInfoObj = {
            100:[],
            200:[],
            300:[]
        }
        for(let artInfo of artInfoList){
            artInfoObj[artInfo.type].push(artInfo.art_id)
        }
        const arts = []
        for(let key in artInfoObj){
            //这里可能存在key是空值，length为0的情况，所以需要判断一下如果是0进行跳出
            const ids = artInfoObj[key]
            if(ids.length === 0){
                continue
            }
            //key因为上面artInfoObj传入的，但是artInfoObj对象中的键值对前面的值是字符串，这里要转换int
            key = parseInt(key)
            arts.push(await Art._getListByType(ids, key))
        }
        return flatten(arts)
        //arts.push的内容是数组，数组push到数组中变成了二维的数组
        //需要把二维数组直接编程一维数组，用lodash内置的方法
    }

    static async _getListByType(ids, type){
        const finder = {
            where:{
                id: {
                    //Op.in是sequelize提供的一组方法，表示id in ids
                    [Op.in]:ids
                },
            }
        }
        let arts = [];
        const scope = 'bh'
        switch (type){
            case 100:
                arts = await Movie.scope(scope).findAll(finder)
                break;
            case 200:
                arts = await Music.scope(scope).findAll(finder)
                break;
            case 300:
                arts = await Sentence.scope(scope).findAll(finder)
                break;
            case 400:
                break;
            default:
                break;
        }
        return arts
    }

    static async getData(art_id, type, useScope= true){
        const finder = {
            where:{
                id: art_id
            }
        }
        let art = null;
        const scope = useScope ? 'bh': null;
        switch (type){
            case 100:
                art = await Movie.scope(scope).findOne(finder)
                break;
            case 200:
                art = await Music.scope(scope).findOne(finder)
                break;
            case 300:
                art = await Sentence.scope(scope).findOne(finder)
                break;
            case 400:
                const { Book } = require('./book'); 
                art = await Book.scope(scope).findOne(finder);
                if (!art) {
                  art = await Book.create({
                    id: art_id,
                  })
                }                
                break;
            default:
                break;
        }
        //if (art && art.image) {
        //    let imgUrl = art.dataValues.image;
        //    art.dataValues.image = global.config.host + imgUrl;
        //}        
        return art
    }
}

module.exports = {
    Art
}