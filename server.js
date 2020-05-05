const turbo = require('turbo-http'),
fs = require('fs'),
path = require('path'),
public_files = __dirname + '/public_files'

const getContentType = function(filePath) {
  var extname = path.extname(filePath);

  switch (extname) {
      case '.html':
          contentType = 'text/html';
          break
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
      case '.ico':
        contentType = 'image/ico';
        break
  }
  return contentType
}

const getFilePath = function(url) {
  let filePath = (url.endsWith('/') ) ? `${public_files}${url}index.html` : public_files + url
  return filePath
}

const removeIntegrityTagsFromHtmlPages = function(data) {
  console.log('removeIntegrityTagsFromHtmlPages')

  let result = data.toString().replace(/integrity=".*"/g,'')
  return result
}

const checkIfFileIsCached = function(filePath, res) {
  let cachedFilePath = `${filePath}_cached`
  let contentType = 'text/html'

  //DEBUG
  console.log('checkIfFileIsCached', cachedFilePath)

  fs.readFile(cachedFilePath, function (err,data) {
    if (err) {
      processHtmlFile(filePath, res);
    } else {

      res.statusCode = 200;
      res.setHeader('Content-Type', contentType)
      res.end(data)      

    }

  });
}

const processHtmlFile = function(filePath, res) {

  let contentType = 'text/html'

  //DEBUG
  console.log('processHtmlFile', filePath)

  fs.readFile(filePath, function (err,data) {
    if (err) {
      res.statusCode = 404;
      res.end(JSON.stringify(err));
      return;
    }
    let dataClean = removeIntegrityTagsFromHtmlPages(data)
    cacheFile(filePath, dataClean)

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType)
    res.end(dataClean);
    
  });

}

const cacheFile = function(cacheFile,data) {
  let cachedFilePath = cacheFile + '_cached'

  //DEBUG
  console.log('cacheFile', cachedFilePath)
  
  fs.writeFile(cachedFilePath, data, (err) => {
    if (err) {
      console.log('The file has been saved!');
    }
    
  });

}

const server = turbo.createServer(function (req, res) {

  let filePath = getFilePath(req.url)
  let contentType = getContentType(filePath)

  if (contentType === 'text/html') {
    checkIfFileIsCached(filePath, res)

  } else {

    fs.readFile(filePath, function (err,data) {
      if (err) {
        res.statusCode = 404;
        res.end(JSON.stringify(err));
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', contentType)
      res.end(data);

  })

  }

})

server.listen(8080)