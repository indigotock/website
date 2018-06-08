
var express = require('express');
var router = express.Router();
var debug = require('debug')('site:routes')
var fs = require('fs')
function serveFile(res, pathName, mime) {
    
    mime = mime || 'text/html';
    
    fs.readFile(__dirname + '../../../' + pathName, function (err, data) {
        if (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end('Error loading ' + pathName + " with Error: " + err);
        }
        res.writeHead(200, {"Content-Type": mime});
        res.end(data);
    });
}
/* GET home page. */
router.get('/kpu/js/:file.mjs', function (req, res, next) {
    debug('out','/public/kpu/js/'+req.params.file+'.mjs')
    serveFile(res,'/public/kpu/js/'+req.params.file+'.mjs','application/javascript')
    // fs.readFile('/public/kpu/js/' + req.params.file+'.mjs', function(err, data) {
    // debug(req.params)
    //   if(err) {
    //     res.send("Oops! Couldn't find that file.");
    //   } else {
    //     // set the content type based on the file
    //     res.contentType('application/javascript');
    //     res.send(data);
    //   }   
    //   res.end();
    // }); 
});

module.exports = router;