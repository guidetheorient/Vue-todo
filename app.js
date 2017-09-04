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
        dateNow:''
    },
    methods:{
        addTodo:function () {
            this.todoList.push({
                title:this.newTodo,
                createdTime:this.setCreatedTime(),
                done:false
            })
            // console.log(this.todoList)
            this.newTodo = ''
            this.saveOrUpdateTodos()
        },
        setCreatedTime:function () {
            var time = new Date(),
                year = time.getFullYear(),
                month = time.getMonth()+1,
                day = time.getDate(),
                hour = time.getHours(),
                minute = time.getMinutes()

                return  (month+ '/'+ day+'\''+ year +' '+ hour +':'+ minute)
        },
        removeTodo:function (item) {
            let index = this.todoList.indexOf(item)
            this.todoList.splice(index,1)
            this.saveOrUpdateTodos()
        },
        signUp:function () {
            // 新建 AVUser 对象实例
            var user = new AV.User();
            // 设置用户名
            user.setUsername(this.formData.username);
            // 设置密码
            user.setPassword(this.formData.password);

            user.signUp().then((loginedUser) => {
               this.currentUser = this.getCurrentUser()
            }, function (error) {
              console.log('注册失败')
            });
        },
        login:function(){
            //箭头函数
            AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser)=> {
                this.currentUser = this.getCurrentUser()
                this.fetchTodos()
            }, function (error) {
                console.log('登录失败')
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
                month = time.getMonth()+1,
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
