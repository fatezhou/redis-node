var redisEx = require('./redisEx')
var redis_client = new redisEx
redis_client.Connect("//127.0.0.1:6379")
var querystring = require('querystring')
var url = require('url')
var http = require('http')
var uuid = require('uuid')

const port = 8899

async function DoWork(urlParam, res){
    if(urlParam['action'] == null){
        res.write('{"error":true, "text":"action is null"}')
    }else{
        if(urlParam['action'] == 'preLogin'){
            //make a uuid , register a object into the queue
            var uuidStr = uuid.v1()
            redis_client.Push('preLogin', {token:uuidStr, data:urlParam['data']})
            //notify the work process to deal the work
            redis_client.Publish('preLogin', "0")
            var len = await redis_client.QLen('preLogin')
            //print the queue len to client
            res.write(JSON.stringify({text:"wait for login", len:len, token:uuidStr}))
        }else if(urlParam['action'] == 'checkLogin'){
            if(urlParam['token'] == null){
                res.write('{"error":true, "text":"no token"}')
            }else{
                let key = urlParam['token']
                var data = await redis_client.Get(key)
                console.info(data)
                if(data != null){
                    redis_client.Del(key)
                    res.write('{"text":"ready to login"}')
                }else{
                    res.write('{"error":true, "text":"can not login yet"}')
                }
            }
        }
    }
    res.end()
}

http.createServer(function(req, res){
    var urlParam = url.parse(req.url)
    res.writeHead(200, {'content-type':'html'})
    if(url.path == '/favicon.ico'){
        res.end()
        return
    }
    try{
        urlParam = querystring.parse(urlParam.query)
        console.info(urlParam)
        DoWork(urlParam, res)
    }catch(err){
        res.write('{"error":true}')
        res.end()
    }
}).listen(port)

console.info("http port : ", port)