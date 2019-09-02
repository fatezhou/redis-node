var redis = require('./redisEx.js')
var redisCli = new redis

redisCli.Connect("//127.0.0.1:6379")

async function SetValue(k, v){
    redisCli.Set(k, v, 10)
}

SetValue("hello", "world")