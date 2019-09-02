var redisEx = require('./redisEx')
var redis_queue = new redisEx
var redis_subscribe = new redisEx
redis_queue.Connect("//127.0.0.1:6379")
redis_subscribe.Connect("//127.0.0.1:6379") // subscribe must be a single connection 

const redisExpireSecond = 1800 // 1800 seconds for exprie

async function DoWork(){
    try{
        var res = await redis_queue.Pop('preLogin')
        if(res != null){
            try{
                var res = JSON.parse(res)
                //do something here
                
                console.info(res)
                redis_queue.Set(res.token, {ready:true, time:Date.now()}, redisExpireSecond)
            }catch(err){
                console.error(err)
            }
        }else{
            console.log("no task here:", Date())
        }
    }catch(err){
        console.error(err)
    }
    //var res = await redis_queue.Keys("*89bc*")
    //console.info(res)
}

redis_subscribe.Subscribe(['preLogin'], function(ch, msg){
    console.info(ch, msg)
    if(ch == 'preLogin'){
        //recv a notify, do something right now
        DoWork()
    }
})

DoWork()
setInterval(function(){
    DoWork()
}, 5000)