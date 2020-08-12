const {sequelize} = require('../../core/db')
const {Sequelize, Model, Op} = require('sequelize')
const {Favor} = require('../models/favor')


class HotBook extends Model{
    static async getAll(){
        const books = await HotBook.findAll({
            order:[
                'index'
            ]
        })
        const ids = []
        books.forEach(element => {
            ids.push(element.id)
        });
        const favors = await Favor.findAll({
            where:{
                art_id:{
                    [Op.in]: ids,
                    type: 400
                }
            },
            group: ['art_id'],
            //group对art_id进行分组，但如果对多个数组分组的话是一个笛卡尔积
            attributes: ['art_id', [Sequelize.fn('COUNT','*'), 'count']]
        })
        books.forEach(element=>{
            HotBook._getEachBookStatus(element, favors)
        })
        return books
    }

    static _getEachBookStatus(book, favors){
        let count = 0
        favors.forEach(element=>{
            if(book.id === element.art_id){
                count = element.get('count')
            }
        })
        book.setDataValue('fav_nums', count)
        return book
    }

}

HotBook.init({
    index: Sequelize.INTEGER,
    image: Sequelize.STRING,
    author: Sequelize.STRING,
    title: Sequelize.STRING
},{
    sequelize,
    tableName: 'hot_book'
})

module.exports = {
    HotBook
}