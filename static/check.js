var GitHubApi = require('github');
var github = new GitHubApi();

github.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_ACCESS_TOKEN || '9ede241bba93a159da7ec81ebad5cd76f13f3633'
});

console.log(process.env.GITHUB_ACCESS_TOKEN);

debugger;

var fs = require('fs');
var xml2js = require('xml2js')
var parser = new xml2js.Parser();

var excludes = [
  'static/sdk/karma.conf.js',
  'static/sdk/package.json',
  'static/sdk/package-lock.json',
  'static/sdk/vendor',
  'static/sdk/vendor',
  'static/sdk/test'
];

function whenFilesLoaded(files){
  files = files.filter(function(file){
    var fileName = file.filename;
    
    if(-1 === fileName.indexOf('static/sdk'))
      return false;

    for (var j = 0; j < excludes.length; j++)
      if(-1 !== fileName.indexOf(excludes[j]))
        return false;

    return true;
  });

  files = files.filter(Boolean);
  
  var addedFiles = files.filter(function(file){
    return 'added' === file.status;
  });

  var modifiedFiles = files.filter(function(file){
    return 'modified' === file.status;
  });

  console.log("here")

  fs.readFile(__dirname + '/coverage/clover.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
      var coverage = result.coverage;
      var project = {};

      if(coverage.project && coverage.project.length)
        project = coverage.project[0];
      
      var testFiles = [];
      var package = project.package[0];
  
      if(package && package.file)
        testFiles = package.file;
  
      var filesPaths = testFiles.map(function(testFile){
        return testFile.$.path;
      });

      //If new file and has no test than fail
      for (var i = 0; i < addedFiles.length; i++) {
        var addedFile = addedFiles[i];
        
        console.log(addedFile.filename)

      }

    });
  });
};

var perPage = 10;
var page = 0;
var allFiles = [];

(function getFiles() {
  github.pullRequests.getFiles({
    owner: 'tvpage',
    repo: 'tvpage-hugo-template',
    number: process.env.SCRUTINIZER_PR_NUMBER || 84,
    per_page: perPage,
    page: page
  }, function(e, res) {

    console.log(e)

    if (e) {
      return;
    }

    var pageFiles = res.data || [];

    allFiles = allFiles.concat(pageFiles);

    if(pageFiles.length === perPage){
      ++page;
      getFiles();
    }else{
      whenFilesLoaded(allFiles);
    }
  });
}())