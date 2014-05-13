/*
 * GET and POST csv files.
 */

var fs = require('fs');

exports.upload = function(req, res){
  res.render('data', { title: 'Upload Data' });
  console.log("Rendered upload form")
};

function printcsv(req, res, next){
  console.log("Receieved a POST to 'upload'");
  // req.files contains our uploaded file.
  // Key into 'csv.file' because that's what we
  // named it in our upload form in 'data.jade'.
  fs.readFile(req.files.csv.file.path, function(err, data){
    // Just dump the contents in the browser.
    res.end(data);
  });
}

exports.csv = function(dir){
  return printcsv;
};