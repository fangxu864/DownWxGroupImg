/**
 * Created by Administrator on 2016/11/12.
 */
var http=require("http");
var fs=require("fs");
var source = fs.readFileSync("./source.txt", "utf8");
var cookie = fs.readFileSync("./cookie.txt", "utf8");



var DownWxImg={
    //获取数据源数组
    getSourceArr:function (source) {
        //替换&amp;
        source=source.replace(/\&amp\;/g,"&");
        //匹配path 和 name 数组
        var pathArr=source.match(/\ssrc\=\"\/cgi-bin[^\"]+/g);
        var nameArr=source.match(/MemberList\"\stitle\=\"[^\"]+/g);
        //定义每一项
        var newEveryPathArr="";
        var newEveryNameArr="";
        //定义返回的总数组
        var totalArr=[];
        for(var i=0;i<pathArr.length;i++){
            var Item={};
            //过滤加工匹配到的源数组
            newEveryPathArr=pathArr[i].replace(/\ssrc\=\"/g,"");
            newEveryPathArr+="&type=big";
            newEveryNameArr=nameArr[i].replace(/MemberList\"\stitle\=\"/g,"");
            newEveryNameArr=newEveryNameArr.replace(/\<[^\>]+\>/g,"");
            //将过滤好的数据封装到数组
            Item["path"]=newEveryPathArr;
            Item["name"]=newEveryNameArr;
            totalArr.push(Item);
        }
        //返回的总数组
        return totalArr
    },
    //下载图片
    DownImg:function (path,name) {
        var options = {
            hostname:"wx.qq.com",
            port:80,
            path:path,
            method:"GET",
            headers: {
                'Accept':'text/html,applcation/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding':'gzip, deflate, sdch',
                'Accept-Language':'zh-CN,zh;q=0.8',
                'Cache-Control':'max-age=0',
                'Connection':'keep-alive',
                'Cookie':cookie,
                'Host':'wx.qq.com',
                // 'Referer':'https://wx.qq.com/?&lang=zh_CN',
                // "If-Modified-Since":"Fri, 11 Nov 2016 16:29:31 GMT",
                'Upgrade-Insecure-Requests':'1',
                'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36'
            }
        };
        var req=http.request(options,function (res) {
            if(res.statusCode!==200){
                console.log("status: "+ res.statusCode);
                console.log("headers: "+ JSON.stringify(res.headers));
            }
            var imgData="";
            res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
            res.on("data",function (chunk) {
                // console.log(Buffer.isBuffer(chunk));
                imgData+=chunk
            });
            res.on("end",function () {
                fs.writeFile("./img/"+name+".jpg", imgData,"binary", function(err){
                    if(err){
                        console.log("down fail");
                    }
                    console.log("down success");
                });
            })
        });
        req.on("error",function (e) {
            console.log('error: '+e.message)
        });
        req.end()
    }
};

var sourceArr=DownWxImg.getSourceArr(source);
console.log(sourceArr.length);
for (var i=0;i<sourceArr.length;i++){
    var path=sourceArr[i]["path"];
    var name=sourceArr[i]["name"];
    // console.log(path+" "+name);
    DownWxImg.DownImg(path,name)
}
// DownWxImg.DownImg("/cgi-bin/mmwebwx-bin/webwxgeticon?seq=0&username=@5d50cf92f0f2ef1677bb44f3e3614ed3&chatroomid=@9a794b9dc1f7452b081caffc5bab9ec0&skey=","wxy2")
