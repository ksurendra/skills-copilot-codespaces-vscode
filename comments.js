// Create web server
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var port = 3000;

// Create server
http.createServer(function (req, res) {
  var uri = url.parse(req.url)
    , filename = path.join(process.cwd(), uri.pathname);

  // Check if the file exists
  fs.exists(filename, function (exists) {
    if (!exists) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.write("404 Not Found\n");
      res.end();
      return;
    }

    // Read file
    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    // Read file
    fs.readFile(filename, "binary", function (err, file) {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.write(err + "\n");
        res.end();
        return;
      }

      // Write file
      res.writeHead(200);
      res.write(file, "binary");
      res.end();
    });
  });
}).listen(parseInt(port, 10));

// Create comments
var comments = [];

// Get comments
function getComments() {
  var commentString = '';

  for (var i = 0; i < comments.length; i++) {
    commentString += comments[i].name + ' said: ' + comments[i].comment + '<br>';
  }

  return commentString;
}

// Add comment
function addComment(name, comment) {
  comments.push({ name: name, comment: comment });
}

// Handle post request
function handlePost(req, res) {
  var body = '';

  req.on('data', function (data) {
    body += data;

    // Too much POST data, kill the connection
    if (body.length > 1e6) {
      req.connection.destroy();
    }
  });

  req.on('end', function () {
    var post = qs.parse(body);

    addComment(post.name, post.comment);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(getComments());
    res.end();
  });
}

// Handle get request
function handleGet(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write
