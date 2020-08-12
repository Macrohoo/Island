
const {Sequelize, Model} = require('sequelize')
const {sequelize} = require('../../core/db')

class Comment extends Model{
    static async addComment(bookID, content){
        const comment = await Comment.findOne({
            where:{
                book_id: bookID,
                content
            }
        })
        if(!comment){
            return await Comment.create({
                book_id: bookID,
                content,
                nums:1
            })
        }else{
            //如果评论完全相同,就把已存在的评论加1
            return await comment.increment('nums', {
                by: 1
            })
        }
    }

    static async getBookComments(bookID){
        const bookcomment = await Comment.findAll({
            where:{
                book_id: bookID,
            }
        })
        return bookcomment
    }

    //toJSON()是为了控制返回的序列化字段只包以下数据内容
/*     toJSON(){
        return{
            content: this.getDataValue('content'),
            //content: this.content   或者这种写法,this指的是Comment
            nums: this.getDataValue('nums'),
            book_id: this.getDataValue('book_id')
            

        }
    } */

}

Comment.init({
    content: Sequelize.STRING(12),
    nums: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    book_id: Sequelize.INTEGER
},{
    sequelize,
    tableName:'comment'
})

module.exports = {
    Comment
}