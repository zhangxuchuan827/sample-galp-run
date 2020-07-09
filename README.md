# zxc-pages

[![NPM Downloads][downloads-image]][downloads-url]
[![NPM Version][version-image]][version-url]
[![License][license-image]][license-url]
[![Dependency Status][dependency-image]][dependency-url]
[![devDependency Status][devdependency-image]][devdependency-url]
[![Code Style][style-image]][style-url]

> Awesome node module

## Installation

```shell
$ npm install zxc-pages

# or yarn
$ yarn add zxc-pages
```

```
命令：

z-run clean
z-run serve
z-run build
z-run clean
z-run lint
z-run start
z-run deploy
```
```
配置文件【zrun.config.js】：
module.exports = {
  data: {
    menus: [{
        name: 'Home',
        icon: 'aperture',
        link: 'index.html'
      }, {
        name: 'Feature',
        link: 'feature.html'
      },
      {
        name: 'About',
        link: 'about.html'
      }, {
        name: 'Contact',
        link: '#',
        children: [{
            name: 'Twitter',
            link: 'index.html'
          },
          {
            name: 'Facebook',
            link: 'index.html'
          },
        ]
      }
    ],
    pkg: require('./package.json'),
    date: new Date()
  },
  build: {
    src: 'src',
    dist: 'dist',
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



```


## Usage

<!-- TODO: Introduction of API use -->

```javascript
const zcePages = require('zxc-pages')
const result = zcePages('zce')
// result => 'zce@zce.me'
```

## API

<!-- TODO: Introduction of API -->

### zcePages(name[, options])

#### name

- Type: `string`
- Details: name string

#### options

##### host

- Type: `string`
- Details: host string
- Default: `'zce.me'`

## Contributing

1. **Fork** it on GitHub!
2. **Clone** the fork to your own machine.
3. **Checkout** your feature branch: `git checkout -b my-awesome-feature`
4. **Commit** your changes to your own branch: `git commit -am 'Add some feature'`
5. **Push** your work back up to your fork: `git push -u origin my-awesome-feature`
6. Submit a **Pull Request** so that we can review your changes.

> **NOTE**: Be sure to merge the latest from "upstream" before making a pull request!

## License

[Apache](LICENSE) &copy; zhangxuchuan <zhangxuchuan827@163.com>

