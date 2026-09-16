# 下载

## 最新版本：EngStudio 1.0.3

安装前请先核对校验和：

```bash
sha256sum -c SHA256SUMS.txt
```

## 平台安装包

| 平台 | 安装包 | 状态 |
|---|---|---|
| Linux (x86_64) | [engstudio-1.0.3-linux-x86_64.deb](https://github.com/wyyy520/ES/releases/download/v1.0.3/engstudio-1.0.3-linux-x86_64.deb) | ✅ 已发布 |
| Windows (AMD64) | — | 🚧 计划在 v1.1.0 提供 |
| macOS | — | 🚧 计划中 |

## 校验和

[SHA256SUMS.txt](https://github.com/wyyy520/ES/releases/download/v1.0.3/SHA256SUMS.txt)

## 安装要求

- **Linux**: Ubuntu 22.04+ / Debian 12+，Qt 6 运行时，Node.js ≥ 20 + npm（服务端一键启动）
- **Windows**: v1.1.0 发布后再支持
- 服务端为自托管模式，数据存储在本机，无需注册账号

## 从源码构建

```bash
git clone git@github.com:wyyy520/ES.git
cd ES
pnpm install
pnpm -r run build
cd packages/server && pnpm dev   # 启动后端（默认 3456 端口）
```

完整的安装与部署说明见 [README](https://github.com/wyyy520/ES/blob/main/README.md)。

## 历史版本

全部历史产物可到 [GitHub Releases](https://github.com/wyyy520/ES/releases) 查看。