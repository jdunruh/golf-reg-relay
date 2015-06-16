var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var streamify = require('gulp-streamify');
var babelify = require('babelify');
var jasmine = require('jasmine');
var reporters = require('jasmine-reporters');
var combiner = require('stream-combiner2');

var path = {
    HTML: './src/index.html',
    MINIFIED_OUT: 'build.min.js',
    OUT: 'app.js',
    DEST: './index.html',
    DEST_BUILD: './js',
    DEST_SRC: './js',
    ENTRY_POINT: './src/js/client/app.js',
    CLIENT_JS: ['scr/js/client/**', 'src/js/common/**', 'src/js/components/**', 'src/js/dispatchers/**', 'src/js/stores/**'],
    CLIENT_JASMINE: ['src/js/client/**', 'src/js/common/**', 'src/js/dispatchers/**', 'src/js/stores/**'],
    SERVER_JS: ['scr/js/server/**', 'src/js/common/**'],
    CLIENT_OUT: 'app.js',
    SERVER_OUT: 'server.js'
};

gulp.task('copy', function(){
    gulp.src(path.HTML)
        .pipe(gulp.dest(path.DEST));
});

gulp.task('watch', function() {
    gulp.watch(path.HTML, ['copy']);

    var watcher  = watchify(browserify({
        entries: [path.ENTRY_POINT],
        transform: [babelify],
        debug: true,
        cache: {}, packageCache: {}, fullPaths: true
    }));

    var combined = combiner.obj([ watcher.on('update', function () {
        watcher.bundle()
            .pipe(source(path.OUT))
            .pipe(gulp.dest(path.DEST_SRC))
        console.log('Updated');
    })
        .bundle()
        .pipe(source(path.OUT))
        .pipe(gulp.dest(path.DEST_SRC))
    ]);
    // any errors in the above streams will get caught
    // by this listener, instead of being thrown:
    combined.on('error', console.error.bind(console));

    return combined;

});

var allSpecFiles = function(dir) {
    if(!fs.statSync(dir).isDirectory())
        throw("must be a directory");
    // all directory entries
    var dirContent = fs.readdirSync(dir).map(function(name) { return dir + '/' + name });
    // only files ending is 'spec.js'
    var files = dirContent.filter(function(fname) { return (fs.statSync(fname).isFile() && (fname.search('spec.js$') != -1))});
    // all directories
    var directories = dirContent.filter(function(fname) { return fs.statSync(fname).isDirectory()});

    // if no subdirectories simply return array of files
    if(directories.length <= 0)
        return files;
    // return array of files concatenated with the files found in all subdirectories (and their subdirectories)
    // the ruduce is just a way to flatten a two level array, since js array doesnt have flatter() or flatmap()
    return files.concat(directories.map(function(dirname) { return allSpecFiles(dirname) }).reduce(function(acc, fileArray) {
        return acc.concat(fileArray);
    }))
};


gulp.task('build', function(){
    browserify({
        entries: [path.ENTRY_POINT],
        transform: [babelify],
    })
        .bundle()
        .pipe(source(path.MINIFIED_OUT))
        .pipe(streamify(uglify(path.MINIFIED_OUT)))
        .pipe(gulp.dest(path.DEST_BUILD));
});

gulp.task('replaceHTML', function(){
    gulp.src(path.HTML)
        .pipe(htmlreplace({
            'js': 'build/' + path.MINIFIED_OUT
        }))
        .pipe(gulp.dest(path.DEST));
});

gulp.task('production', ['replaceHTML', 'build']);

gulp.task('default', ['watch']);