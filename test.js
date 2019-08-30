var RedisClient = require('./redisUtil')

RedisClient.Connect("//127.0.0.1:6379")
RedisClient.Push("fin", {a:1})
//RedisClient.Push("fin", {a:2})
//RedisClient.Push("fin", {a:3})

async function Do(){
    //res = await RedisClient.Pop("fin")
    //res = await RedisClient.Get("Hello")
    res = await RedisClient.QueueLen('preLogin')
    console.info(res)
    RedisClient.client.llen('preLogin', function(res1, res2){
        console.info(res1, res2)
    })
}

Do()
