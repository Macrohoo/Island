const bcrypt = require('bcryptjs')
const {sequelize} = require('../../core/db')

const {Sequelize, Model} = require('sequelize')

class User extends Model{
    static async verifyEmailPassword(email, plainPassword){
        const user = await User.findOne({
            where:{
                email: email
            }
        })
        if(!user){
            throw new global.errs.AuthFailed('账号不存在')
        }
        //数据库中用户的密码是加密的，但是客户输入的密码是不加密的，比较用到bcrypt.compareSync
        const correct = bcrypt.compareSync(plainPassword, user.password)
        if(!correct){
            throw new global.errs.AuthFailed('密码不正确')
        }
        // 因为token中还需要调用这个user，需要return出来
        return user
    }

    static async getUserByOpenid(openid){
        const user = await User.findOne({
            where:{
                openid
            }
        })
        return user
    }

    static async registerByOpenid(openid){
        return await User.create({
            openid
        })
    }
}

User.init({
    //权限接口保护 Token
    id:{
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nickname: Sequelize.STRING,
    email:{
        type:Sequelize.STRING(128),
        unique: true
    },
    password:{
        type:Sequelize.STRING,
        //set函数是特定的，都可以在model下面的每个字段加入这个特定函数达到自己设计的目的
        set(val){
            const salt = bcrypt.genSaltSync(10)
            //生成盐，用bcrypt下面的gensaltsync方法生成， bcrypt是暗文密码包
            const psw = bcrypt.hashSync(val,salt)
            this.setDataValue('password',psw)
            //setDataValue是User集成的Model模型中的方法，用this调用
        }
    },
    openid:{
        type:Sequelize.STRING(64),
        unique: true
    },
    test:Sequelize.STRING,
},{
    sequelize,
    tableName:'user'
})


module.exports = {
    User
}

