const turbo = require('turbo-http'),
fs = require('fs'),
path = require('path'),
public_files = __dirname + '/public_files'

const getContentType = function(filePath) {
  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
      case '.js':
          contentType = 'text/javascript';
          break
      case '.css':
          contentType = 'text/css';
          break
      case '.json':
          contentType = 'application/json';
          break
      case '.png':
          contentType = 'image/png';
          break
      case '.jpg':
          contentType = 'image/jpg';
          break
      case '.wav':
          contentType = 'audio/wav';
          break
  }
  return contentType
}

const server = turbo.createServer(function (req, res) {
  let filePath = (req.url === '/' ) ? `${public_files}/index.html` : public_files + req.url
  let contentType = getContentType(filePath);

  //DEBUG
  console.log(filePath, contentType);
  
  fs.readFile(filePath, function (err,data) {
    if (err) {
      res.statusCode = 404;
      res.end(JSON.stringify(err));
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType)
    res.end(data);
  });
})

server.listen(8080)