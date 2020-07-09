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
const prodServer = browserSync.create()
const cwd = process.cwd()

let config = {
  data: {},
  build: {
    host: 'localhost',
    port: '8080',
    https: false,
    src: 'src',
    dist: 'dist',
    temp: '.tmp',
    public: 'public'
  },
  deploy: {
    remotePath: 'dist',
    host: '',
    port: 21,
    user: '',
    pass: ''
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
    server: {
      baseDir: [config.build.temp, config.build.src, config.build.public],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}
// 启动dev服务器
const dev = series(cleanAll, complie, serve)

// 构建
const build = series(cleanAll, parallel(series(complie, useref), extraPublic,
  compressImage, compressFont), cleanTmp)

// 启动prod服务器
const prodRun = done => {
  prodServer.init({
    notify: false,
    host: config.host,
    port: config.port,
    https: config.https,
    open: false,
    server: {
      baseDir: [config.build.dist],
    }
  })
}
// 启动
const start = series(build, prodRun)

const pushToServer = (done) => {
  if (config.deploy.remotePath === '' ||
    config.deploy.host === '' ||
    config.deploy.user === '' ||
    config.deploy.pass === '') {
    done(new Error('请填写相关deploy配置'))
    return
  }
  return src(config.dist).pipe(plugin.deployFtp({
    remotePath: config.deploy.remotePath,
    host: config.deploy.host,
    port: config.deploy.port,
    user: config.deploy.user,
    pass: config.deploy.pass
  }))
}

const deploy = series(build, pushToServer)

module.exports = {
  serve: dev,
  build,
  clean: cleanAll,
  lint,
  start,
  deploy
}
