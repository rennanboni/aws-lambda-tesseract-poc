const cp = require('child_process');
const fs = require("fs");
const http = require('http');
const https = require('https');

const download = (url, dest, cb) => {
  const caller = url.startsWith('https') ? https : http;
  
  const file = fs.createWriteStream(dest);
  const request = caller.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  });
}

module.exports.main = (event, context, callback) => {
  const urlFile = event.queryStringParameters.file;
  
  console.log(`downloading file: ${urlFile}`);
  const destinationFile = '/tmp/photo';
  download(urlFile, destinationFile, async () => {
    const stdout = await cp.execFileSync('tesseract', [ destinationFile, 'stdout', '-l', 'eng' ]);
    fs.unlinkSync(destinationFile);  
    
    callback(undefined, {
      statusCode: 200,
      headers: {
      },
      body: stdout.toString()
    });
  });
  
};
