'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var pkg = require('./package');
var now = new Date();
var scripts = {
      all: [
        'gulpfile.js',
        'docs/js/main.js'
      ],
      site: '_gh_pages/js',
      src: 'js/*.js',
      dest: 'dist'
    };
var styles = {
      all: [
        'dist/simple.css',
        'docs/css/main.css'
      ],
      site: '_gh_pages/css',
      main: 'dist/simple.css',
      src: 'scss/*.scss',
      dest: 'dist'
    };
var html = {
      jade: 'docs/**/*.jade',
      src: [
        'docs/**',
        '!docs/**/*.jade'
      ],
      dest: '_gh_pages'
    };
var assets = {
      css: 'assets/css',
      js: 'assets/js'
    };
var replacement = {
      regexp: /@\w+/g,
      filter: function (placeholder) {
        switch (placeholder) {
          case '@VERSION':
            placeholder = pkg.version;
            break;

          case '@YEAR':
            placeholder = now.getFullYear();
            break;

          case '@DATE':
            placeholder = now.toISOString();
            break;
        }

        return placeholder;
      }
    };

gulp.task('jshint', function () {
  return gulp.src(scripts.all)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'));
});

gulp.task('jscs', function () {
  return gulp.src(scripts.all)
    .pipe(plugins.jscs())
    .pipe(plugins.jscs.reporter());
});

gulp.task('js', ['jshint', 'jscs']);

gulp.task('csslint', function () {
  return gulp.src(styles.all)
    .pipe(plugins.csslint('.csslintrc'))
    .pipe(plugins.csslint.reporter());
});

gulp.task('css', ['csslint'], function () {
  return gulp.src(styles.src)
    .pipe(plugins.sass({
      outputStyle: 'expanded'
    }))
    .pipe(plugins.replace(replacement.regexp, replacement.filter))
    .pipe(plugins.autoprefixer({
      browsers: [
        'Android 2.3',
        'Android >= 4',
        'Chrome >= 20',
        'Firefox >= 24',
        'Explorer >= 8',
        'iOS >= 6',
        'Opera >= 12',
        'Safari >= 6'
      ]
    }))
    .pipe(plugins.csscomb())
    .pipe(gulp.dest(styles.dest))
    .pipe(gulp.dest(styles.site))
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(plugins.minifyCss({
      compatibility: 'ie8',
      keepSpecialComments: 1
    }))
    .pipe(gulp.dest(styles.dest))
    .pipe(gulp.dest(styles.site));
});

gulp.task('sass', function () {
  return gulp.src(styles.src)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({
      outputStyle: 'expanded'
    }))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest(styles.dest));
});

gulp.task('jade', function () {
  return gulp.src(html.jade)
    .pipe(plugins.jade({
      pretty: true,
      locals: {
        development: true
      }
    }))
    .pipe(gulp.dest(html.dest));
});

gulp.task('html', function () {
  return gulp.src(html.jade)
    .pipe(plugins.jade({
      pretty: true
    }))
    .pipe(plugins.htmlcomb())
    .pipe(gulp.dest(html.dest));
});

gulp.task('assets#js', function () {
  return gulp.src([
      'bower_components/jquery/dist/jquery.min.js',
      'bower_components/clipboard/dist/clipboard.min.js',
      'bower_components/code-prettify/loader/prettify.js'
    ])
    .pipe(gulp.dest(assets.js));
});

gulp.task('assets#css', function () {
  return gulp.src([
      'bower_components/code-prettify/loader/prettify.css'
    ])
    .pipe(gulp.dest(assets.css));
});

gulp.task('assets', ['assets#js', 'assets#css']);

gulp.task('docs', function () {
  return gulp.src(html.src, {
      base: 'docs'
    })
    .pipe(gulp.dest(html.dest));
});

gulp.task('site', ['docs', 'html', 'assets']);

gulp.task('release', ['js', 'css', 'site'], function () {
  return gulp.src('dist/*.{js,css}')
    .pipe(gulp.dest('_releases/' + pkg.version));
});

gulp.task('watch', function () {
  gulp.watch(styles.src, ['sass']);
  gulp.watch(html.jade, ['jade']);
  gulp.watch(html.src, ['docs']);
});

gulp.task('default', ['watch']);
