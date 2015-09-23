var gulp = require('gulp')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var streamify = require('gulp-streamify')
var stylus = require('gulp-stylus')
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

gulp.task('css',function(){
  gulp.src('./demo/css/main.styl')
    .pipe(stylus({
      'include css': true
    }))
    .pipe(gulp.dest('./demo/css/'));
});

gulp.task('watch',['js:dev','css'],function(){
  gulp.watch(['src/*.js','src/*.svg'],['js:dev']);
  gulp.watch(['demo/css/*.styl'],['css']);
});

gulp.task('build',function(){
  buildJS({minify:true,gsap:false});
});

gulp.task('connect', function() {
  connect.server();
  opener('http://localhost:8080/demo');
});
gulp.task('connect-close', function(){
  //connect.serverClose();
})

gulp.task('default', ['connect']);
