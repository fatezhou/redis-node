var redis = require('redis')

function RedisClient2(){
    function ValueToString(value){
        var str = ""
        if(typeof(value) == "object" || typeof(value) == "function"){
            str = JSON.stringify(value)
        }else if(typeof(value) == "number"){
            str = value + ""
        }else if(typeof(value) == "string"){
            str = value
        }else if(typeof(value) == "boolean"){
            if(value){
                str = "true"
            }else{
                str = "false"
            }
        }else{
            return null
        }
        return str
    }
    var client
    this.expireTimeSecond = 1800
    this.Connect = function(url){
        client = redis.createClient(url)
    }
    this.Select = function(nIndex){
        client.select(nIndex)
    }
    this.SetDefaultExpire = function(expireTimeSecond){
        this.expireTimeSecond = expireTimeSecond
    }
    this.Set = function(key, value, expireTimeSecond){
        var str = ValueToString(value)
        if(typeof(key) != "string" || str == null){
            return
        }
        expireTimeSecond = expireTimeSecond | this.expireTimeSecond
        client.set(key, str, "ex", expireTimeSecond)
    }
    this.Get = function(key){
        return new Promise(function(resovle, reject){
            client.get(key, function(err, value){
                if(err != null){
                    reject(err)
                }else{
                    resovle(value)
                }
            })
        })
    }
    this.Del = function(key){
        client.del(key)
    }
    this.Push = function(key, value, bFront){
        var str = ValueToString(value)
        if(str != null){
            if(bFront == null || bFront == false){
                client.rpush(key, str)
            }else{
                client.lpush(key, str)
            }
        }
    }
    this.Pop = function(key, bFront){
        return new Promise(function(resovle, reject){
            if(bFront == null || bFront == true){
                client.lpop(key, function(err, value){
                    if(err != null){
                        reject(err)
                    }else{
                        resovle(value)
                    }
                })
            }else{
                client.rpop(key, function(err, value){
                    if(err != null){
                        reject(err)
                    }else{
                        resovle(value)
                    }
                })
            }
        })
    }
    this.Foreach = function(key, nStartIndex, nStopIndex){
        return new Promise(function(resovle, reject){
            if(nStartIndex < 0){
                resovle([])
            }
            if(nStopIndex == null){
                nStopIndex = -1
            }
            if(nStartIndex == null){
                nStartIndex = 0
            }
            client.lrange(key, nStartIndex, nStopIndex, function(err, list){
                if(err != null){
                    reject(err)
                }else{
                    resovle(list)
                }
            })
        })
    }
    this.QLen = function(key){
        return new Promise(function(resovle, reject){
            client.llen(key, function(err, len){
                if(err != null){
                    reject(err)
                }else{
                    resovle(len)
                }
            })
        })
    }
    this.Subscribe = function(keys, callback){
        client.subscribe(keys)
        client.on('message', function(channel, message){
        callback(channel, message)
        })
    }
    this.Publish = function(key, value){
        var str = ValueToString(value)
        if(str != null){
            client.publish(key, str)
        }
    }
    this.Unsubscribe = function(keys){
        client.unsubscribe(keys)
    }
    this.Keys = function(key){
        return new Promise(function(resovle, reject){
            client.keys(key, function(err, value){
                if(err != null){
                    reject(err)
                }else{
                    resovle(value)
                }
            })
        })
    }
    this.Close = function(){
        client.end()
    }
    this.Expire = function(key, seconds){
        client.expire(key, seconds, function(e, v){})
    }
    this.RemoveAll = function(){
        client.flushall() // may remove all keys, include queues, be more carefull
    }
    this.redis = function(){ // export the redis object, to supply some actions
        return client
    }
}

module.exports = RedisClient2