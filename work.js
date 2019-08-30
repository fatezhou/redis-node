var redisEx = require('./redisEx')
var redis_queue = new redisEx
var redis_subscribe = new redisEx
redis_queue.Connect("//127.0.0.1:6379")
redis_subscribe.Connect("//127.0.0.1:6379")

async function DoWork(){
    try{
        var res = await redis_queue.Pop('preLogin')
        console.info(res)
        if(res != null){
            try{
                var res = JSON.parse(res)
                //do something here
                redis_queue.Set(res.token, {ready:true})
            }catch(err){
                console.error(err)
            }
        }else{
            console.log("no task here:", new Date())
        }
    }catch(err){
        //console.error(err)
    }
    
}

redis_subscribe.Subscribe(['preLogin'], function(ch, msg){
    console.info(ch, msg)
    if(ch == 'preLogin'){
        //recv a notify
        DoWork()
    }
})
DoWork()
setInterval(function(){
    DoWork()
}, 5000)