var GitHubApi = require('github');
var github = new GitHubApi();
var exit = require('exit');

github.authenticate({
  type: "basic",
  username: 'rfornes',
  password: 'Jrfp030685311'
});

var fs = require('fs');
var xml2js = require('xml2js')
var parser = new xml2js.Parser();

var filterExcludes = function(files){
  var excludes = [
    'static/karma.conf.js',
    'static/package.json',
    'static/package-lock.json',
    'static/test'
  ];

  return files.filter(function(file){
    var name = file.filename;
    if(-1 === name.indexOf('static/sdk'))
      return false;

    for (var j = 0; j < excludes.length; j++)
      if(-1 !== name.indexOf(excludes[j]))
        return false;

    return true;
  }).filter(Boolean);
};

var checkCoverageFileMetrics = function(file){
  var metrics = file.metrics;
  var params = [
    'statements',
    'conditionals',
    'methods'
  ];

  for (var k = 0; k < params.length; k++) {
    var param = params[k];
    var count = metrics[param];
    if (count > 0 && ( (metrics['covered' + param] * 100) / count ) < 75)
      return false;
  }

  return true;
};

var searchCoverageFile = function(coveredFiles,query){
  for (var j = 0; j < coveredFiles.length; j++) {
    var coveredFile = coveredFiles[j];
    if(-1 !== coveredFile.path.indexOf(query))
      return coveredFile;
  }
  return null;
};

var getCoverageFiles = function(res){
  var coverage = res.coverage;
  var project = {};

  if(coverage.project && coverage.project.length)
    project = coverage.project[0];
  
  var files = [];
  var package = project.package[0];

  if(package && package.file)
    files = package.file;

  return files.map(function(f){
    return {
      path: f.$.path,
      metrics: f.metrics[0].$
    }
  });
};

function whenFilesLoaded(files){
  files = filterExcludes(files);

  fs.readFile(__dirname + '/../coverage/clover.xml', function(err, data) {
    if(err){
      throw new Error("can't read coverage report");
    }

    parser.parseString(data, function (err, result) {
      if(err){
        throw new Error("can't parse xml");
      }

      for (var i = 0; i < files.length; i++) {
        var coverageFile = searchCoverageFile(
          getCoverageFiles(result),
          files[i].filename
        );
        
        if(!coverageFile){
          console.error("The file doesn't have coverage data. \n");
          exit(1);
        } else if(!checkCoverageFileMetrics(coverageFile)){
          console.error("File's coverage is under 75%. \n");
          exit(1);
        }
      }

      exit(0);
    });
  });
};

var perPage = 10;
var page = 0;
var allFiles = [];

(function loadFiles() {
  github.pullRequests.getFiles({
    owner: 'tvpage',
    repo: 'tvpage-hugo-template',
    number: process.env.SCRUTINIZER_PR_NUMBER || 84,
    per_page: perPage,
    page: page
  }, function(e, res) {
    if (e) {
      throw new Error("can't get repo files");
    }

    var pageFiles = res.data || [];

    allFiles = allFiles.concat(pageFiles);
    
    if(pageFiles.length === perPage){
      ++page;
      loadFiles();
    }else{
      whenFilesLoaded(allFiles);
    }
  });
}())