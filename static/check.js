var fs = require("fs");

fs.readdir(__dirname + '/../../artifacts', function(err, items) {
  if(err)
    console.log(err)
});

var branch   = process.env.SCRUTINIZER_BRANCH;
var prNumber   = process.env.SCRUTINIZER_PR_NUMBER;
var srcBranch   = process.env.SCRUTINIZER_PR_SOURCE_BRANCH;
var sha   = process.env.SCRUTINIZER_SHA1;
var uuid   = process.env.SCRUTINIZER_INSPECTION_UUID;
var project   = process.env.SCRUTINIZER_PROJECT;

console.log( branch )
console.log( prNumber )
console.log( srcBranch )
console.log( sha )
console.log( uuid )
console.log( project )