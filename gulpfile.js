const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const rename = require("gulp-rename");
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');

function browsersync() {
    browserSync.init({
        server: { baseDir: 'app/'},
        notify: false,
        online: true
    })
}

function scripts() {
    return src([
        'app/scripts/app.js',
    ])
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(dest('app/scripts'))
    .pipe(browserSync.stream())
}

function styles() {
    return src('app/sass/style.scss')
    .pipe(sass())
    .pipe(rename({suffix: '.min'}))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
    .pipe(cleancss(( {level: {1: {specialComments: 0} }/*, format: 'beautify' */ } )))
    .pipe(dest('app/styles/'))
    .pipe(browserSync.stream())
}

function images() {
    return src('app/images/src/**/*')
    .pipe(newer('app/images/dest/'))
    .pipe(imagemin())
    .pipe(dest('app/images/dest/'))
}

function cleanimg() {
    return del('app/images/dest/**/*', { force: true })
}

function build() {
    return src([
       'app/styles/**/*.min.css',
       'app/scripts/**/*.min.js',
       'app/images/dest/**/*',
       'app/**/*.html',
   ], {base: 'app'})
   .pipe(dest('build'));
}

function startwatch() {
    watch(['app/**/*.scss', '!app/**/*.min.css'], styles);
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
    watch('app/**/*.html').on('change', browserSync.reload);
    watch('app/images/src/**/*', images);
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.cleanimg = cleanimg;
exports.build = series(styles, scripts, images, build);

exports.default = parallel(styles, scripts, browsersync, startwatch)