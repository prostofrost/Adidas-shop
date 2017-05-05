var gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    autoprefixer    = require('gulp-autoprefixer'),
    browserSync     = require('browser-sync'),
    concat          = require('gulp-concat'),
    uglify          = require('gulp-uglifyjs'),
    cssnano         = require('gulp-cssnano'),
    rename          = require('gulp-rename'),
    del             = require('del'),
    imagemin        = require('gulp-imagemin'),
    pngquant        = require('imagemin-pngquant'),
    cache           = require('gulp-cache'),
    jade            = require('gulp-jade'),
    jadeGlobbing    = require('gulp-jade-globbing');

gulp.task('sass', function() {
    return gulp.src(['src/assets/styles/*.sass', 'src/assets/styles/*.scss'])
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8'], {cascade: true}))
    .pipe(gulp.dest('dev/assets/styles'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('markup', function() {
  return gulp.src('src/states/*.jade')
    .pipe(jadeGlobbing())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('dev'));
});

gulp.task('jade-watch', ['markup'], browserSync.reload, function() {
    return gulp()
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('scripts', function() {
    gulp.src('src/assets/js/app.js')
    .pipe(gulp.dest('dev/assets/js'))
    .pipe(browserSync.reload({stream:true}));
});
    
// task for js libs

// gulp.task('scripts-libs', ['scripts'], function() {
//     return gulp.src([
//         'src/assets/libs/jquery/dist/jquery.min.js',
//         'src/assets/libs/magnific-popup/dist/jquery.magnific-popup.js'
//     ])
//     .pipe(concat('libs.min.js'))
//     .pipe(uglify())
//     .pipe(gulp.dest('dev/assets/js'));
// });

gulp.task('css-libs', ['sass'], function() {
    return gulp.src('dev/assets/styles/libs.css')
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dev/assets/styles'));
})

gulp.task('clean', function(){
    return del.sync('build');
});

gulp.task('clear', function(){
    return cache.clearAll();
});

gulp.task('img', function() {
    return gulp.src('src/assets/images/**/*')
    .pipe(cache(imagemin({
        interlaced: true,
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    })))
    .pipe(gulp.dest('dev/assets/images'))
    .pipe(gulp.dest('build/img'))
});

gulp.task('watch', ['browser-sync', 'css-libs', 'markup', 'img'], function() {
    gulp.watch(['src/assets/styles/*.sass', 'src/assets/styles/*.scss'], ['sass']);
    gulp.watch('src/states/*.jade', ['jade-watch']);
    gulp.watch('src/assets/js/app.js', ['scripts']);
});


gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'dev'
        },
        notify: false
    })
});

gulp.task('build', ['clean', 'img', 'sass'],  function() {
    var buildCss = gulp.src([
        'dev/assets/styles/main.css',
        'dev/assets/styles/libs.min.css'
    ])
        .pipe(gulp.dest('build/assets/styles'));

    var buildFonts = gulp.src(['app/fonts/**/*'])
        .pipe(gulp.dest('build/assets/fonts'));
    
    var buildJs = gulp.src('dev/assets/js/**/*')
        .pipe(gulp.dest('build/assets/js'));

    var buildHtml = gulp.src('dev/*.html')
    .pipe(gulp.dest('build'));
});