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
sass.compiler = require('node-sass');
/* глобальное подключение всех scss блоков в основной файл стилей  */
const sassGlob = require('gulp-sass-glob');


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
  return src('./src/scss/main.scss')
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('./build/css/'))
    .pipe(browserSync.reload({ stream: true }));
});
/* таск: слежка за изменениями в файлах проекта */
watch('./src/html/**/*.html', series('html'));
watch('./src/scss/**/*.scss', series('styles'));


/* таск: статический сервер для просмотра проекта в браузере  */
task('server', () => {
  browserSync.init({
    server: {
      baseDir: './build/',
    },
  });
});
/* основной таск (дефолтный): последовательное выполнение очистка, копирование файлов. */
task('default', series('clean', 'html', 'styles', 'server'))