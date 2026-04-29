# Scaffold Tree Template

根据项目变量替换尖括号占位符。

说明：

- `domain-a`、`domain-b` 只是示例占位符，来源于用户提供的 `feature-domains` 清单
- 实际输出时按业务域数量展开，不限制为两个目录

```text
src/
  core/
    hooks/
    http/
    query/
    router/
    store/
    utils/
  features/
    <domain-a>/
      pages/
        index/
          page.tsx
          page.test.tsx
          index.ts
      components/
      services/
      types/
      constants/
      hooks/
    <domain-b>/
      pages/
      components/
      services/
      types/
      constants/
      hooks/
  components/
  layouts/
  theme/
  assets/
docs/
  codebase-map/
plan/
```

可选扩展：

- 如果需要 demo/mock 模式，可增加 src/core/demo/ 或 src/mocks/
- 如果需要移动端控件抽象，可增加 src/components/mobile/ 或 src/lib/responsive/
- 如果需要自定义 lint 规则，可增加单独规则目录，或直接并入现有 lint 配置

页面目录规则：

- 静态路由优先使用 pages/[segment]/page.tsx 这种可映射形式
- 嵌套路由镜像到 pages 子目录
- 动态路由使用 [param]
- 父级布局使用 _layout

常量与组件定位规则：

- 页面专属常量镜像 pages 结构
- 页面专属组件进入 components/[page-name]/
- 跨 feature 组件放入 src/components/
