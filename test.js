var redis = require('./redisEx.js')
var redisCli = new redis

redisCli.Connect("//127.0.0.1:6379")

redisCli.Set("Hello", "World", 1000)

setTimeout(() => {
    (async function(){
        const res = await redisCli.TTL("Hello")
        console.info(res)
    })()
}, 2000);