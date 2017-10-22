import Vue from 'vue';

//leanCloud初始化
import AV from 'leancloud-storage'
var APP_ID = 'jtAW3G77T4uOHeCaa7HLOK9C-gzGzoHsz';
var APP_KEY = 'BkRDjA3CLrKzAxmy4khFIovK';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});


var app = new Vue({
    el:'#app',
    data:{
        newTodo:'',
        todoList:[],
        actionType:'login',
        formData:{
            username:'',
            password:''
        },
        currentUser:null,
        dateNow:'',
        message:'',
        show:false,
        //danger  success  info warning   
        iconList:['chacha','tick','exclamation2','exclamation1'],
        iconBgList:['#ff4949','#13ce66','#50bfff','#f7ba2a'],
        iconBg:'',
        iconName:''
    },
    methods:{
        addTodo:function () {
            this.todoList.push({
                title:this.newTodo,
                createdTime:this.setCreatedTime(),
                done:false
            })
            this.newTodo = ''
            this.saveOrUpdateTodos()
        },
        setCreatedTime:function () {
            var time = new Date(),
                year = time.getFullYear(),
                month = addZeroBefore(time.getMonth()+1),
                day = addZeroBefore(time.getDate()),
                hour = addZeroBefore(time.getHours()),
                minute = addZeroBefore(time.getMinutes());

                return  (month+ '/'+ day+'\''+ year +' '+ hour +':'+ minute)

                function addZeroBefore(number){
                    if(number<10){
                        return '0'+number
                    }else{
                        return number
                    }
                }
        },
        removeTodo:function (item) {
            let index = this.todoList.indexOf(item)
            this.todoList.splice(index,1)
            this.saveOrUpdateTodos()
        },
        signUp:function () {
            let username = this.formData.username
            let password = this.formData.password
            if(username.length===0 ||password.length===0){
                this.message = '用户名或密码未填写'
                this.alertMessage(3)
                return
            }else if(username.indexOf(' ')!==-1&&password.indexOf(' ')!==-1){
                this.message = '用户名或密码不允许有空格'
                this.alertMessage(3)
                return
            }else if(password.length < 4){
                this.message = '密码不得少于4位'
                this.alertMessage(3)
                return
            }else {
                // 新建 AVUser 对象实例
                var user = new AV.User();
                // 设置用户名
                user.setUsername(this.formData.username);
                // 设置密码
                user.setPassword(this.formData.password);

                user.signUp().then((loginedUser) => {
                this.currentUser = this.getCurrentUser()
                this.message = '注册成功'
                this.alertMessage(1)
                },  (error)=> {
                    if(error.code === 202){
                        this.message = '用户名已被注册';
                    }else{
                        this.message = '注册失败'
                    }
                    this.alertMessage(0)             
                });
            }
        },
        alertMessage:function(number){
            this.iconName = this.iconList[number]
            this.iconBg = this.iconBgList[number]
            this.show = true
        },
        afterEnter:function(){
            this.show = false
        },
        login:function(){
            //箭头函数
            AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser)=> {
                console.log(loginedUser)
                this.message = '登录成功'
                this.alertMessage(2)
                this.currentUser = this.getCurrentUser()
                this.fetchTodos()
            }, (error)=> {
                console.dir(error)
                if(error.code === 210){
                    this.message = '用户名和密码不匹配';
                }else if(error.code === 211){
                    this.message = '不存在此用户名'
                }else if(error.code === 219){
                    this.message = '登录过于频繁，请稍后再试'
                    this.alertMessage(3)
                    return
                }else{
                    this.message = '登录失败'
                }
                this.alertMessage(0)
            });
        },
        getCurrentUser:function () {
            // console.log(AV.User.current())
            let current = AV.User.current()
            if(current){
                let {id,createdAt,attributes:{username}} = AV.User.current()
                return {id,username,createdAt}
            } else {
                return null
            }
        },
        logout:function () {
            AV.User.logOut()
            this.currentUser = null
            window.location.reload()
        },
        saveTodos:function(){
            let session = JSON.stringify(this.todoList)
            var Todofolder = AV.Object.extend('Todofolder')
            var todofolder = new Todofolder()
            
            //设置当前content的可以被当前登录的用户读写
            var acl = new AV.ACL()
            acl.setReadAccess(AV.User.current(),true)
            acl.setWriteAccess(AV.User.current(),true)

            todofolder.set('content',session)

            todofolder.setACL(acl)

            todofolder.save().then((todo)=> {
                this.todoList.id = todo.id
                console.log('保存成功')
            },function (error) {
                alert('保存失败')
            })
        },
        updateTodos:function () {
            let session = JSON.stringify(this.todoList)
            let avTodos = AV.Object.createWithoutData('Todofolder',this.todoList.id)
            avTodos.set('content',session)
            avTodos.save().then(()=>{
                console.log('更新成功')
            })

        },
        saveOrUpdateTodos:function () {
            if(this.todoList.id){
                this.updateTodos()
            }else{
                this.saveTodos()
            }
        },
        fetchTodos:function(){
            if(this.currentUser){
                var query = new AV.Query('Todofolder')
                query.find()
                    .then((todos)=> {
                        let avAllTodos = todos[0]
                        let id = avAllTodos.id
                        this.todoList = JSON.parse(avAllTodos.attributes.content)
                        this.todoList.id = id
                    },function (error) {
                        console.error(error)
                    })
            }
        },
        setDateNow:function () {
            var time = new Date(),
                year = time.getFullYear(),
                month = time.getMonth(),
                day = time.getDate(),
                weekday = time.getDay(),
                weekdayList = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
                monthList = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."],
            
            weekday = weekdayList[weekday]
            month = monthList[month]

            this.dateNow = weekday + ', '+ day + ' '+ month
        }
    },
    created:function () {
        this.currentUser = this.getCurrentUser()
        this.fetchTodos()
        this.setDateNow()

        // window.onbeforeunload = ()=>{
        //     let session = JSON.stringify(this.todoList)
        //     localStorage.setItem('myTodos',session)
            
        //     let newTodoSession = JSON.stringify(this.newTodo)
        //     // localStorage.setItem('myNewTodo',newTodoSession)
            
        //     // var AVTodos = AV.Object.extend('AllTodos')
        //     // var avTodos = new AVTodos()
        //     // avTodos.set('content',session)
        //     // avTodos.save().then(function (todo) {
        //     //     console.log('保存成功')
        //     // },function (error) {
        //     //     console.log('保存失败')
        //     // });
        // }
        
    
        // let previousData = JSON.parse(localStorage.getItem('myTodos'))
        // this.todoList = previousData || []
        
        // if(Array.isArray(previousData)){
        //     this.todoList = previousData;
        // }else{
        //     this.todoList = [];
        // }

        // let previousNewTodo = JSON.parse(localStorage.getItem('myNewTodo'))
        //console.log(typeof previousNewTodo)
        //不加||''，第一次挂了，提示this.todoList.push和splice is not a func
        // this.newTodo = previousNewTodo || ''
    }
})
