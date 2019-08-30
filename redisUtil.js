const redis = require('redis')

RedisClient = function(){

}

function ValueToString(value){
    var str = ""
    if(typeof(value) == "object" || typeof(value) == "function"){
        str = JSON.stringify(value)
    }else if(typeof(value) == "number"){
        str = value + ""
    }else if(typeof(value) == "string"){
        str = value
    }else{
        return null
    }
    return str
}

RedisClient.Connect = function(url){
    var client = redis.createClient(url)
    client.on('error', function(error){
        console.error("RedisClient.Connect.error:" + error)
    })
    client.select("0", function(error){
        if(error){
            console.error("RedisClient.Connect.select:" + error)
        }
    })
    RedisClient.client = client
}

RedisClient.SetDictionary = function(nIndex){
    RedisClient.client.select(nIndex + "", function(error){
        if(error){
            console.error("SetDictionary.select:" + error)
        }
    })
}

RedisClient.Set = function(key, value){
    var str = ValueToString(value)
    if(typeof(key) != "string" || str == null){
        return
    }

    RedisClient.client.set(key, str)
}

RedisClient.Get = function(key){
    return new Promise(function(resovle, reject){
        RedisClient.client.get(key, function(err, value){
            if(err != null){
                reject(err)
            }else{
                resovle(value)
            }
        })
    })
}

RedisClient.ClearQueue = function(queueName){
    RedisClient.client.del(queueName)
}

RedisClient.Del = RedisClient.ClearQueue

RedisClient.Push = function(queueName, value, bPushFront){
    var str = ValueToString(value)
    if(str != null){
        if(bPushFront == null || bPushFront == false){
            RedisClient.client.rpush(queueName, str)
        }else{
            RedisClient.client.lpush(queueName, str)
        }
    }
}

RedisClient.Pop = function(queueName, bPopFront){
    return new Promise(function(resovle, reject){
        if(bPopFront == null || bPopFront == true){
            RedisClient.client.lpop(queueName, function(err, value){
                if(err != null){
                    reject(err)
                }else{
                    resovle(value)
                }
            })
        }else{
            RedisClient.client.rpop(queueName, function(err, value){
                if(err != null){
                    reject(err)
                }else{
                    resovle(value)
                }
            })
        }
    })
}

RedisClient.Foreach = function(queueName, nStartIndex, nStopIndex){
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
        RedisClient.client.lrange(queueName, nStartIndex, nStopIndex, function(err, list){
            if(err != null){
                reject(err)
            }else{
                resovle(list)
            }
        })
    })
}

RedisClient.QueueLen = function(queueName){
    return new Promise(function(resovle, reject){
        RedisClient.client.llen(queueName, function(err, len){
            if(err != null){
                reject(err)
            }else{
                resovle(len)
            }
        })
    })
}

RedisClient.Subscribe = function(channelName, callback){
    RedisClient.client.subscribe(channelName)
    RedisClient.client.on('message', function(channel, message){
        callback(channel, message)
    })
}

RedisClient.Publish = function(channelName, value){
    var str = ValueToString(value)
    if(str != null){
        RedisClient.client.publish(channelName, str)
    }
}

RedisClient.Unsubscribe = function(channelName){
    RedisClient.client.unsubscribe(channelName)
}

RedisClient.Close = function(){
    RedisClient.client.end(true)
}

module.exports = RedisClient