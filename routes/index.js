var http=require('http');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/app/:pageName', function(req, res, next) {
  var pageName=req.params.pageName;
  res.render(pageName);
});
//转发登录请求至Java服务器
router.get('/func/login', function(req, res, next) {
	var userName=req.query.userName;
	var password=req.query.password;

	var reqOption = {
		host : '121.42.179.184', // here only the domain name
		port : 8080,
		path : '/examSys/ws/login/check?userName='+userName+'&password='+password,
		method : 'GET' // do GET
	};
	console.log('@login:open connention');
	var reqGet=http.request(reqOption,function(hRes){
		var loginCode=hRes.statusCode;
		console.log('@login init connention--');
		console.log('@login hRes.statusCode:'+loginCode);
		if(loginCode==200){
			hRes.on('data',function(d){
				console.log('@login:got response');
				process.stdout.write(d);
				if(d=='no match'){
					res.statusCode = 401;
					res.send(d);
				}else{
					res.setHeader("Content-Type", "application/json; charset=utf-8");
					res.send(d);
				}
			});
		}else{
			res.statusCode = loginCode;
			res.end();
		}	
	});
	reqGet.end();
	reqGet.on('error',function(e){
		console.error(e);
	});
});

module.exports = router;
