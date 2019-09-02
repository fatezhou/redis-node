var redis = require('./redisEx.js')
var redisCli = new redis

redisCli.Connect("//127.0.0.1:6379")

redisCli.Set("Hello", "World", 1000)


async function BPOP(){
    res = await redisCli.BPop("list", 10)
    console.info(res)
}

function BPOP2(){
    redisCli.BPop2("list", 10000, function(err, value){
        console.info(err, value)
    })
}

BPOP()