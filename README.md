# resource-center

这是一个基于 Vue 3 与 Vite 的资源中台前端项目，目前以功能 demo 和交互原型为主。

## 推荐的 IDE 配置

[VS Code](https://code.visualstudio.com/) + [Vue 官方插件（Volar）](https://marketplace.visualstudio.com/items?itemName=Vue.volar)，并禁用 Vetur。

## 推荐的浏览器配置

- Chromium 内核浏览器（Chrome、Edge、Brave 等）：
  - 安装 [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - 在 Chrome DevTools 中启用 [Custom Object Formatter](http://bit.ly/object-formatters)
- Firefox：
  - 安装 [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - 在 Firefox DevTools 中启用 [Custom Object Formatter](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## `.vue` 导入的 TypeScript 支持

TypeScript 默认无法直接处理 `.vue` 文件的类型信息，因此本项目使用 `vue-tsc` 代替 `tsc` 做类型检查。在编辑器中需要使用 Volar，让 TypeScript 语言服务能够正确识别 `.vue` 类型。

## 配置参考

详见 [Vite 配置文档](https://vite.dev/config/)。

## 项目安装

```sh
npm install
```

## 本地开发

```sh
npm run dev
```

## 运行测试

```sh
npm test
```

## 生产构建

```sh
npm run build
```

## 本地预览构建结果

```sh
npm run preview
```
