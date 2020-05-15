const turbo = require('turbo-http'),
fs = require('fs'),
path = require('path'),
util = require('util'),
public_files = __dirname + '/public_files',
readfile = util.promisify(fs.readFile)


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

async function checkIfFileIsCached(filePath) {
  let cachedFilePath = `${filePath}_cached`

  //DEBUG
  console.log('checkIfFileIsCached', cachedFilePath)
  let dataClean = await readfile(cachedFilePath)

  return dataClean

}

async function processHtmlFile(filePath) {

  //DEBUG
  console.log('processHtmlFile', filePath)

  let data = await readfile(filePath)
  let dataClean = removeIntegrityTagsFromHtmlPages(data)
  cacheFile(filePath, dataClean)
  return dataClean

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

const handle = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => Promise.resolve([undefined, error]));
}

async function processRequest(req, res) {

  let filePath = getFilePath(req.url)
  let contentType = getContentType(filePath)

  if (contentType === 'text/html') {

    let [dataClean, err] = await handle(checkIfFileIsCached(filePath))

    if (err) {

       //DEBUG
       console.log('File is not cached => then process it')

       let [ dataClean, err ] = await handle(processHtmlFile(filePath))

       if (err) {
        res.statusCode = 404;
        res.end(JSON.stringify(err));
        return;
       } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', contentType)
        res.end(dataClean);
        return
       }

    } else {

      //DEBUG
      console.log('File is cached => sending back')

      res.statusCode = 200;
      res.setHeader('Content-Type', contentType)
      res.end(dataClean);
      return

    }
    
  } else {

    let [ data, err ] = await handle(readfile(filePath))

    if (err) {
      res.statusCode = 404;
      res.end(JSON.stringify(err));
      return;
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType)
      res.end(data);
      return
    }
   
  }

}

const server = turbo.createServer(processRequest)

server.listen(8020)