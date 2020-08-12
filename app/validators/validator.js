const {LinValidator, Rule} = require('../../core/lin-validator-v2')
const {User} = require('../models/user')

const {LoginType, ArtType} = require('../lib/enum')
const { HttpException } = require('../../core/http-exception')

class PositiveIntegerValidator extends LinValidator{
    constructor(){
        super()
        this.id = [
            new Rule('isInt', '需要正整数', {min:1}),
        ]
    }
}

class RegisterValidator extends LinValidator{
    constructor(){
        super()
        this.email = [
            new Rule('isEmail', '不符合Email规范')
        ]
        this.password1 = [
            new Rule('isLength', '密码至少6个字符，最多32个字符',{
                min:6,
                max:32
            }),
            new Rule('matches','密码不符合规范','^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]')
        ]
        this.password2 = this.password1
        this.nickname = [
            new Rule('isLength', '昵称不符合长度规范', {
                min: 4,
                max: 32,
            })
        ]
    }

    validatePassword(vals){
        const psw1 = vals.body.password1
        const psw2 = vals.body.password2
        if(psw1 !== psw2){
            throw new Error('两个密码必须相同')
        }
    }

    async validateEmail(vals){
        const email = vals.body.email
        //这里用async和await是因为sequelize查询的结果都是一个promise
        //也间接影响了后面api user中的validator验证器的异步执行
        const user = await User.findOne({
            where:{
                email:email   //前面的email是数据库查询email字段
            }
        })
        if(user){
            throw new Error('邮箱已被注册！')
        }
    }
}

class TokenValidator extends LinValidator{
    constructor(){
        super()
        this.account = [
            new Rule('isLength', '不符合账号规则', {
                min: 4,
                max: 32
            })
        ]
        this.secret = [
            new Rule('isOptional'),
            new Rule ('isLength', '至少6个字符', {
                min: 6,
                max: 128
            })
        ]
    }

    validateLoginType(vals){
        if(!vals.body.type){
            throw new Error('type是必须参数')
        }
        if(!LoginType.isThisType(vals.body.type)){
            throw new Error('type参数不合法')
        }
    }
}

class NotEmptyValidator extends LinValidator{
    constructor(){
        super()
        this.token = [
            new Rule('isLength', '不允许为空',{min: 1})
        ]
    }
}

function checkType(vals){
    //vals参数传入的时候如果是放在路径path上的参数，校验isThisType的时候，type到底是字符串还是数字类型的问题会报错
    //因为在isThisType中的检验是===恒等于，所以这里需要把type做parseInt的转换
    let type = vals.body.type || vals.path.type
    if(!type){
        throw new Error('type是必须参数')
    }
    type = parseInt(type)
    if(!LoginType.isThisType(type)){
        throw new Error('type参数不合法')
    }
}

function checkArtType(vals){
    let type = vals.body.type || vals.path.type
    if(!type){
        throw new Error('type是必须参数')
    }
    type = parseInt(type)
    if(!ArtType.isThisType(type)){
        throw new Error('type参数不合法')
    }
}


//Checker类写在这里只是提供一种思路，不使用这个类，我们再生成一个checkArtType函数来解决问题
class Checker{
    constructor(type){
        this.enumType = type
    }

    check(vals){
        let type = vals.body.type || vals.path.type
        if(!type){
            throw new Error('type是必须参数')
        }
        type = parseInt(type)
        if(!this.enumType.isThisType(type)){
            throw new Error('type参数不合法')
        }
    }
}

class LikeValidator extends PositiveIntegerValidator{
    constructor(){
        super()
        this.validataType = checkArtType
        //用Checker类的代码实现//const checker = new Checker(ArtType)
        //用Checker类的代码实现//this.validateType = checker.check.bind(checker)
    }
}

class ClassicValidator extends LikeValidator{

}

class SearchValidator extends LinValidator{
    constructor(){
        super()
        this.q = [
            new Rule('isLength', '搜索关字不能为空', {min:1, max:16})
        ]
        //分页 start, count 从start开始取,count表示取几条
        //有可能客户start,count都不传,就是默认default
        this.start = [
            new Rule('isInt', 'start不符合规范', {min:0, max:60000}),
            new Rule('isOptional', '', 0) //默认校验isOptional,默认从0条开始查询
        ]
        this.count = [
            new Rule('isInt', 'count不符合规范', {
                min: 1,
                max: 20
            }),
            new Rule('isOptional', '', 20)
        ]
    }
}

class AddShortCommentValidator extends PositiveIntegerValidator{
    constructor(){
        super()
        this.content = [
            new Rule('isLength', '必须在1-12个字符之间',{
                min: 1,
                max: 12
            })
        ]
    }
}

module.exports = {
    PositiveIntegerValidator,
    RegisterValidator,
    TokenValidator,
    NotEmptyValidator,
    LikeValidator,
    ClassicValidator,
    SearchValidator,
    AddShortCommentValidator
}