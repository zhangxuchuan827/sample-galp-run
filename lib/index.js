const {
  src,
  dest,
  series,
  parallel,
  watch
} = require('gulp')
const browserSync = require('browser-sync')
const loadPlugin = require('gulp-load-plugins')
const del = require('del')
const path = require('path')

const plugin = loadPlugin()
const devServer = browserSync.create()
const cwd = process.cwd()

let config = {
  data: {},
  build: {
    src: 'src',
    dist: 'dist',
    temp: '.tmp',
    public: 'public'
  }
}
try {
  let loadConfig = require(path.join(cwd), '/pages.config.js')
  config = Object.assign({}, config, loadConfig)
} catch (error) {}

// 编译scss样式
const complieStyle = done => {
  return src(`${config.build.src}/assets/styles/*.scss`, {
      base: config.build.src,
      cwd: config.build.src
    })
    .pipe(plugin.sass({
      outputStyle: 'expanded'
    }))
    .pipe(dest(config.build.temp))
}

// 编译JS
const complieScript = done => {
  return src(`**/*.js`, {
      base: config.build.src,
      cwd: config.build.src
    })
    .pipe(plugin.babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(dest('.tmp'))
}

// 编译模板文件
const complieTemplate = done => {
  return src(`**/*.html`, {
      base: config.build.src,
      cwd: config.build.src
    })
    .pipe(plugin.swig({
      data: config.data
    }))
    .pipe(dest('.tmp'))
}

// 同步编译所有文件
const complie = parallel(complieTemplate, complieScript, complieStyle)

// 压缩图片
const compressImage = done => {
  return src(`assets/images/**`, {
      base: config.build.src,
      cwd: config.build.src
    })
    .pipe(plugin.imagemin())
    .pipe(dest(config.build.dist))
}

// 压缩字体
const compressFont = done => {
  return src(`assets/fonts/**`, {
      base: config.build.src,
      cwd: config.build.src
    })
    .pipe(plugin.imagemin())
    .pipe(dest(config.build.dist))
}

// 导出public
const extraPublic = done => {
  return src(`**`, {
      base: config.build.public,
      cwd: config.build.public
    })
    .pipe(dest(config.build.dist))
}

// 文件引用处理
const useref = done => {
  return src(`*.html`, {
      base: config.build.temp,
      cwd: config.build.temp
    })
    .pipe(plugin.useref({
      searchPath: [config.build.temp, '.']
    }))
    .pipe(plugin.if(/\.html$/, plugin.htmlmin({
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(plugin.if(/\.js$/, plugin.uglify()))
    .pipe(plugin.if(/\.css$/, plugin.cleanCss()))
    .pipe(dest(config.build.dist))
}

// 删除导出的文件
const cleanAll = (done) => {
  return del([config.build.dist, config.build.temp])
}
const cleanTmp = done => {
  return del([config.build.temp])
}

// eslint检查
const lint = (done) => {
  return src(['**/*.js'], {
      base: config.build.src,
      cwd: config.build.src
    })
    .pipe(plugin.eslint({
      rules: {}
    }))
    .pipe(plugin.eslint.format())
    .pipe(plugin.eslint.failAfterError())
}

// 启动本地测试服务
const serve = (done) => {
  watch(`assets/styles/*.scss`, {
    cwd: config.build.src
  }, complieStyle)
  watch(`**/*.js`, {
    cwd: config.build.src
  }, complieScript)
  watch(`**/*.html`, {
    cwd: config.build.src
  }, complieTemplate)
  watch([
    `assets/images/**`,
    `assets/font/**`,
  ], {
    cwd: config.build.src
  }, devServer.reload)
  watch([
    `**`
  ], {
    cwd: config.build.public
  }, devServer.reload)

  devServer.init({
    notify: false,
    port: 8080,
    open: false,
    // files: 'dist/**',
    server: {
      baseDir: [config.build.temp, config.build.src, config.build.public],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}

const dev = series(cleanAll, complie, serve)
const build = series(cleanAll, parallel(series(complie, useref), extraPublic,
  compressImage, compressFont), cleanTmp)

const start = (done) => {

  done()
}
const deploy = (done) => {

  done()
}


module.exports = {
  serve: dev,
  build,
  clean: cleanAll,
  lint,
  start,
  deploy
}
