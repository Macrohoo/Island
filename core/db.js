const {Sequelize, Model} = require('sequelize')
const {unset, clone} = require('loadsh')
const {dbName, host, port, user, password} = require('../config/config').database

const sequelize = new Sequelize(dbName, user, password,{
    dialect: 'mysql',  //指定数据库类型
    host,
    port,
    logging: true,   //操作数据库时在命令行中都显示出来
    timezone: '+08:00',    //北京时区时间
    define:{
        timestamps: true, //createdAt, updatedAt
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        underscored: true,
        freezeTableName: true,
        //scopes为了返回de序列化字段中都删除以下不需要的字段（如created_at等)
        //这里是在sequelize的实例db中全局设置调用
        scopes:{
            bh:{
                attributes: {
                    exclude: ['created_at', 'updated_at', 'deleted_at']
                },
            }
        }
    },
})

//每次保存程序文件后是否重置数据库
sequelize.sync({
    force: false
})

Model.prototype.toJSON = function(){
    let data = clone(this.dataValues)
    unset(data, 'updated_at')
    unset(data, 'created_at')
    unset(data, 'deleted_at')


    for (key in data) {
        if (key === 'image') {
          if (!data[key].startsWith('http')) {
            data[key] = global.config.host + data[key];
          }
        }
    }

    
    return data
}


module.exports = {
    sequelize
}