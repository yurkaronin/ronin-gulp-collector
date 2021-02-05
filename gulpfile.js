const { task, src, dest, watch, series } = require('gulp');

/* очистка папки build */
const rm = require('gulp-rm');
/* статический сервер*/
const browserSync = require('browser-sync').create();
/* подключение html-фрагментов кода */
const fileInclude = require('gulp-file-include');
/* продолжение работы сборщика при возникновении ошибок */
const plumber = require('gulp-plumber');

const notify = require('gulp-notify');
/* сборка css */
const sass = require('gulp-sass');
/* глобальное подключение всех scss блоков в основной файл стилей  */
const sassGlob = require('gulp-sass-glob');
/* генератор карты проекта  */
const sourcemaps = require('gulp-sourcemaps');
/* группировка медиа-запросов в стилевых файлах  */
const gcmq = require('gulp-group-css-media-queries');
/* минификация css */
const cleanCSS = require('gulp-clean-css');
/* автопрефиксер */
const autoprefixer = require('gulp-autoprefixer');
/* объединение файлов в один  */
const concat = require('gulp-concat');
/* транспиляция js  */
const babel = require('gulp-babel');
/* минификация js и исключение неиспользуемого кода */
const uglify = require('gulp-uglify');

sass.compiler = require('node-sass');

/* таск: удаление папки build + доп аргументов передаем запрет на считывание файлов - это не нужно.*/
task('clean', () => {
  return src('./build/**/*', { read: false }).pipe(rm());
});
/* таск: собираем html файлы */
task('html', () => {
  return src('./src/html/*.html')

    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {
          title: 'HTML include',
          sound: false,
          message: err.message
        }
      })
    }
    ))
    .pipe(fileInclude())
    .pipe(dest('./build/'))
    .pipe(browserSync.reload({ stream: true }));
});
/* таск: сборка стилей css  */
task('styles', () => {
  return src(['./node_modules/normalize.css/normalize.css', './src/scss/main.scss'])
    .pipe(sourcemaps.init())
    .pipe(concat('main.css'))
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(gcmq())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    .pipe(dest('./build/css/'))
    .pipe(browserSync.reload({ stream: true }));
});
/* таск: работа с js  */
task('scripts', () => {
  return src(['./src/js/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('main.js', { newLine: ';' }))
    .pipe(
      babel({
        presets: ['@babel/env']
      }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(dest('./build/js/'))
    .pipe(browserSync.reload({ stream: true }));
});

/* таск: слежка за изменениями в файлах проекта */
watch('./src/html/**/*.html', series('html'));
watch('./src/scss/**/*.scss', series('styles'));
watch('./src/js/**/*.js', series('scripts'));


/* таск: статический сервер для просмотра проекта в браузере  */
task('server', () => {
  browserSync.init({
    server: {
      baseDir: './build/',
    },
  });
});
/* основной таск (дефолтный): последовательное выполнение очистка, копирование файлов. */
task('default', series('clean', 'html', 'styles', 'scripts', 'server'))
