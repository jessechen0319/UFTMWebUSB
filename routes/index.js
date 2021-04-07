var express = require('express');
var execute = require('./commandExecutor').execute;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/getCommand", function(req, res, next){
    let cmd = `java -jar ${__dirname}/test_main.jar jessehello`;
    execute(cmd, output=>{
      res.end(output);
    });
});

function stringToHex(text){
  let values = text.match(/.{1,2}/g);
  let index = 0;
  let result = [];
  for(let value of values){
    index++;
    if(index > 1) {
      let hex;
      let codeItem = `hex = 0x${value}`;
      eval(codeItem);
      result.push(hex);
    }
  }
  return Buffer.from(result);
}

router.get("/test", function(req, res, next){
  let testString = '0Xfafb';
  let values = stringToHex(testString);
  for(let value of values) {
    console.log(value);
  }
  res.end("end");
});

module.exports = router;
