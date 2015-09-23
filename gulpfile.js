var gulp = require('gulp')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var streamify = require('gulp-streamify')
var uglify = require('gulp-uglify')
var extend = require('extend')
var connect = require('gulp-connect')
var opener = require('opener');

function buildJS(options){
  if(typeof options=="undefined") options={};

  options=extend({
    minify:false,
    gsap:false,
  },options);

  var bundleStream=browserify('./src/main.js',{standalone:'ElasticProgress'});

  if(!options.gsap){
    bundleStream=bundleStream.ignore('gsap').ignore('jquery');
  }

  bundleStream=bundleStream
    .bundle()
    .on('error',function(e){
      console.log(e.message)
    })

  bundleStream
    .pipe(source('elastic-progress.js'))
    .pipe(gulp.dest('./dist/'))

  if(options.minify){
    bundleStream
      .pipe(source('elastic-progress.min.js'))
      .pipe(streamify(uglify()))
      .pipe(gulp.dest('./dist/'))
  }
}

gulp.task('js',function(){
  buildJS({minify:true});
});
gulp.task('js:dev',function(){
  buildJS({minify:false});
});

gulp.task('watch',['js:dev'],function(){
  gulp.watch(['src/*.js','src/*.svg'],['js:dev']);
});

gulp.task('build',function(){
  buildJS({minify:true,gsap:false});
});

gulp.task('connect', function() {
  connect.server();
  opener('http://localhost:8080/demo');
});

gulp.task('default', ['connect','watch']);
