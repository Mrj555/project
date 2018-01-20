var express = require('express');
var router = express.Router();
var UserModel = require("../model/User");
var GoodsModel = require("../model/Goods");
var multiparty = require("multiparty");

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
	res.render('login', { title: '登录界面' });
});

router.get('/admin', function(req, res, next) {
	res.render('admin', { title: '后台界面' });
});

router.get('/add_goods', function(req, res, next) {
	res.render('add_goods', { title: '商品添加界面' });
});

router.get('/list_page1', function(req, res, next) {
	res.render('list_page1', { title: '商品列表界面' });
});

//router.get('/changes', function(req, res, next) {
//	res.render('changes', {title: '商品添加界面' });
//});

//商品信息
router.post('/api/goods_upload', function(req, res, next) {
	var form = new multiparty.Form({
		uploadDir: "public/images"
	});
	var result = {
		code: 1,
		message: "商品信息保存成功"
	};
	form.parse(req, function(err, body, files) {
		if(err) {
			console.log(err);
		}
		console.log(body);
		var goods_name = body.goods_name[0];
		var price = body.price[0];
		var imgPath = files["img"][0].path.replace("public\\", "");
		var gm = new GoodsModel();
		gm.goods_name = goods_name;
		gm.price = price;
		gm.imgPath = imgPath;
		gm.flag = 1;
		gm.save(function(err) {
			if(err) {
				result.code = -99;
				result.message = "商品保存失败";
			}
			res.json(result);
		})
	})
});

//取出商品信息
router.post('/api/goods_msg', function(req, res, next) {
	var condition = req.body.condition;
	// 注意代码的健壮性
	// 测试中，有异常系测试。 后端最头疼的是异常系测试。
	var pageNO = req.body.pageNO || 1;
	pageNO = parseInt(pageNO);
	var perPageCnt = req.body.perPageCnt || 10;
	perPageCnt = parseInt(perPageCnt);

	GoodsModel.count({flag: condition}, function(err, count){
		console.log("数量:" + count);
		var query = GoodsModel.find({flag: condition})
		.skip((pageNO-1)*perPageCnt).limit(perPageCnt);
		query.exec(function(err, docs){
			console.log(err, docs);
			var result = {
				total: count,
				data: docs,
				pageNO: pageNO,
				perPageCnt : perPageCnt
			}
			res.json(result);
		});
	})
});


//删除商品信息
router.post('/api/remove_goods',function(req, res, next){		
	var goods_name = req.body.goods_name;
	var result = {
		code: 1,
		message: "商品信息删除成功"
	};
	GoodsModel.remove({goods_name:goods_name},(err,docs)=>{
		if(docs.length == 0) {
			result.code = -101;
			result.message = "没有该商品！"
		} 
		res.json(result);
	})
		
})


//编辑商品信息
router.post('/api/goods_chang',function(req, res, next){		
	var name = req.body.goods_name;
	GoodsModel.find({goods_name:name},(err,docs)=>{
		var result={
			data : docs
		};
		res.json(result);
	})
})



//登录
router.post('/api/login4ajax', function(req, res, next) {
	var username = req.body.username;
	var psw = req.body.psw;
	var capthcha = req.body.capthcha;
	var result = {
		code: 1,
		message: "登录成功"
	};
	if(capthcha == "") {
		result.code = -554;
		result.message = "验证码不能为空";
		res.json(result);
		return;
	}
	if(username == "admin" && psw == "h5h5h5h5") {
		res.json(result);

	} else {
		result.code = -555;
		result.message = "用户名或密码错错误，请重新输入";
		res.json(result);
	}
})

module.exports = router;