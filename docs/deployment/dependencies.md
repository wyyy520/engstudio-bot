# EngStudio Dependencies
# 部署到新设备时，在项目根目录执行: pnpm install
#

============================================================
Package: engstudio (package.json)
============================================================

--- devDependencies ---
  @types/node @ ^26.1.1
  rimraf @ ^6.0.0
  typescript @ ^5.7.0
  vitest @ ^3.0.0
  eslint @ ^8.57.0
  prettier @ ^3.4.0

============================================================
Package: @engstudio/engine (packages\engine\package.json)
============================================================

--- dependencies ---
  @engstudio/shared @ workspace:*
  chokidar @ ^4.0.0
  handlebars @ ^4.7.8
  uuid @ ^11.0.0
  winston @ ^3.17.0

--- devDependencies ---
  @types/uuid @ ^10.0.0

============================================================
Package: @engstudio/shared (packages\shared\package.json)
============================================================

--- devDependencies ---

