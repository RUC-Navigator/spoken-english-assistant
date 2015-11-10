var express = require('express');
var fs = require('fs');
var ai = require('./ai.js');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var app = express();


var STATIC_PATH = 'static';			// 文件路径
var UPLOAD_PATH = STATIC_PATH + '/uploads/';	// 上传文件目录
var OUT_PATH = STATIC_PATH + '/out/';			// 处理后生成文件的目录


// ROUTES
app.get('/', function (req, res) {
  res.sendFile('static/index.html', {root: './'});
});

app.post('/src/postaudio', multipartMiddleware, function (req, res) {
	// 存文件
	var fname = req.body.fname || 'file' + Math.floor(Math.random() * 1000000) + '.wav';
	var filedata = req.body.data;

	var data = filedata.substr(filedata.indexOf(',') + 1);

	var b = new Buffer(data, 'base64');
	var filepath = UPLOAD_PATH + fname;
	
	fs.writeFile(filepath, b, 'binary',function (err) {
		if (err) {
			console.log(err);
			res.json({
				status: -1,
				msg: err
			});
		} else {
			res.json({
				status: 0,
				msg: 'success',
				id: fname
			});
			// 处理
			handleFile(filepath);
		}
	});
});
// 轮询，如果文件已生成，返回status 0及文件路径
app.get('/src/getresult', function (req, res) {
	var filename = getFileName(req.query.id);
	var outfile = OUT_PATH + filename;	
	var scriptfile = outfile + '_transcription';

	fs.exists(outfile, function (exists) {
		if (exists) {
			fs.readFile(scriptfile, 'utf-8', function (err, data) {
				if (err) {
					console.log(err);
				}
				fs.readFile(outfile + '.txt', 'utf-8', function (err, trans) {
					res.json({
						status: 0, 
						path: outfile.replace('static', ''),
						txt: data,
						pre: trans
					});
				});
			});			
		} else {
			res.json({statu: -1, msg: '请稍候'});
		}
	});
});

// 处理上传来的音频文件并输出生成文件
var getFileName = function (filepath) {
	// console.log('filepath', filepath);
	if (filepath!=undefined) {
		var fname = filepath.split('/');
		fname = fname[fname.length - 1];
		return fname;
	}
};
function handleFile(filepath) {
	var fname = getFileName(filepath);
	var outputWav = OUT_PATH + fname;
	var outputScript = OUT_PATH + fname + '.txt';
	ai(filepath, outputScript, outputWav);
}






app.use(express.static(STATIC_PATH));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server listening at http://%s:%s', host, port);
});