var GitHubApi = require('github');
var exit = require('exit');
var fs = require('fs');
var xml2js = require('xml2js')
var parser = new xml2js.Parser();
var colors = require('colors/safe');

var fail = function(m,e){
  console.log(colors.red(m),e || '');
  exit(1);
};

var pass = function(){
  console.log(colors.green("Check passed.\n"));
  exit(0);
};

//Removes the file paths that we don't need to run the check against. This
//is based in the includes/excludes options.
function filter(files){

  var includes = (process.env.CI_INCLUDES + "").split(",");
  var excludes = (process.env.CI_EXCLUDES + "").split(",");

  return files.filter(function(file){
    var path = file.filename;

    for (var i = 0; i < includes.length; i++)
      if(-1 === path.indexOf(includes[i]))
        return false;

    for (var j = 0; j < excludes.length; j++)
      if(-1 !== path.indexOf(excludes[j]))
        return false;

    return true;
  }).filter(Boolean);
};

//Checks that the metrics of the passed file are covered 75 & up.
var getFileMetrics = function(file){
  if(!file.metrics){
    return null;
  }

  var obj = {};
  var metrics = file.metrics;
  var params = [
    'statements',
    'conditionals',
    'methods'
  ];

  for (var k = 0; k < params.length; k++) {
    var param = params[k];
    var count = metrics[param];
    obj[param] = count <= 0 ? 100 : (metrics['covered' + param] * 100) / count;
  }

  return obj;
};

//Retrieves & parses the coverage report in XML, it returns a JSON representation
//of the report.
var getCoverageFiles = function(cback){
  fs.readFile(__dirname + process.env.COVERAGE_REPORT_PATH, function(error, data) {
    if(error){
      fail("Can't read coverage report.\n", error);
    }

    parser.parseString(data, function (error, result) {
      if(error){
        fail("Can't parse xml.\n", error);
      } else if('function' === typeof cback){

        var coverage = result.coverage;
        var project = {};
      
        if(coverage.project && coverage.project.length)
          project = coverage.project[0];
        
        var files = [];
        var packages = project.package || [];
        for (var i = 0; i < packages.length; i++) {
          var package = packages[i];
          if(package.file)
            files = files.concat(package.file);
        }
      
        files = files.map(function(f){
          return {
            path: f.$.path,
            metrics: f.metrics[0].$
          };
        });

        cback(files);
      }
    });
  });
};

function checkFiles(files){
  getCoverageFiles(function(coverageFiles){
    files = filter(files);

    for (var i = 0; i < files.length; i++) {
      var path = files[i].filename;
      var matchFile = null;

      for (var j = 0; j < coverageFiles.length; j++) {
        var coverageFile = coverageFiles[j];
        if(-1 !== coverageFile.path.indexOf(path))
          matchFile = coverageFile;
      }
      
      var fileMsg = "File: " + path;
      if(matchFile === null){
        fail(fileMsg + " has zero coverage.\n");
      }

      var fileMetrics = getFileMetrics(matchFile);
      var failMsg = "coverage is: ";

      var statements = fileMetrics.statements;
      if (statements < 75) {
        fail(fileMsg + " statements " + failMsg + statements);
      }

      var conditionals = fileMetrics.conditionals;
      if (conditionals < 75) {
        fail(fileMsg + " conditionals " + failMsg + conditionals);
      }

      var methods = fileMetrics.methods;
      if (methods < 75) {
        fail(fileMsg + " methods " + failMsg + methods);
      }
    }

    pass();
  });
};

//We will first load all the pull request files page by page, we trigger the check
//once all files are loaded.
var filesPerPage = 10;
var filesPage = 0;
var pullRequestFiles = [];
(function loadPullRequestFiles() {
  var github = new GitHubApi();

  github.authenticate({
    type: "basic",
    username: process.env.GB_USERNAME,
    password: process.env.GB_PASSWORD
  });

  github.pullRequests.getFiles({
    owner: process.env.REPO_OWNER,
    repo: process.env.REPO_NAME,
    number: process.env.SCRUTINIZER_PR_NUMBER,
    per_page: filesPerPage,
    page: filesPage
  }, function(error, response) {
    if (error) {
      fail("Can't get repo files.\n", error);
    } 

    var responseFiles = response.data || [];

    pullRequestFiles = pullRequestFiles.concat(responseFiles);
    
    if(responseFiles.length === filesPerPage){
      ++filesPage;
      loadPullRequestFiles();
    }else{
      console.log(colors.yellow("Pull request with: "+ pullRequestFiles.length +" files.\n"));
      checkFiles(pullRequestFiles);
    }
  });
}())