# 插件自动收录工具

## 快速开始

### 1. 安装依赖（如果需要）

```bash
# 本脚本使用 Node.js 内置模块，无需安装额外依赖
```

### 2. 收录插件

```bash
npm run add-plugin -- --repo https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
```

### 3. 覆盖已存在的插件

```bash
npm run add-plugin -- --repo https://github.com/username/plugin-repo --force
```

## 支持的参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `--repo` | GitHub 仓库 URL（必需） | `--repo https://github.com/user/repo` |
| `--force` | 覆盖已存在的插件 | `--force` |

## 输出示例

```
ℹ Claude Code 插件自动收录工具

ℹ 仓库 URL: https://github.com/example/plugin
ℹ 临时目录: /tmp/claude-plugin-xyz123

正在克隆仓库...
✓ 仓库克隆成功

验证插件结构...
✓ 插件结构验证通过

ℹ 插件名称: example-plugin
ℹ 插件描述: An example plugin for Claude Code
ℹ 插件作者: Example Author

正在复制插件文件...
✓ 插件文件复制成功

插件内容:
  - .claude-plugin
  - README.md
  - commands

正在更新 marketplace.json...
ℹ 添加新插件到 marketplace.json
✓ marketplace.json 更新成功

正在清理临时文件...
✓ 临时文件清理完成

✓ 插件 "example-plugin" 已成功添加到 external_plugins/

ℹ 位置: external_plugins/example-plugin

下一步:
  1. 查看插件文件确保内容正确
  2. 检查 .claude-plugin/marketplace.json 文件
  3. 测试插件是否正常工作
  4. 提交更改到 Git 仓库

安装命令:
  /plugin install example-plugin@claude-plugin-directory
```

## 常见问题

### Q: 脚本支持哪些仓库平台？

A: 目前只支持 GitHub 仓库。URL 必须包含 `github.com`。

### Q: 如果插件仓库不在根目录怎么办？

A: 插件的 `.claude-plugin` 目录必须在仓库根目录。如果不是，需要手动调整。

### Q: 可以批量收录多个插件吗？

A: 目前脚本一次只能收录一个插件。可以使用 shell 脚本循环调用:

```bash
#!/bin/bash
repos=(
  "https://github.com/user/plugin1"
  "https://github.com/user/plugin2"
  "https://github.com/user/plugin3"
)

for repo in "${repos[@]}"; do
  npm run add-plugin -- --repo "$repo"
done
```

### Q: 脚本会修改原始仓库吗？

A: 不会。脚本只是克隆到临时目录，复制文件后删除临时目录。

### Q: 收录失败后需要手动清理吗？

A: 不需要。脚本会自动清理临时文件，即使发生错误。

## 技术细节

- 使用 Node.js 内置模块（`child_process`, `fs`, `path`, `os`）
- 使用 `git clone --depth 1` 进行浅克隆，节省时间和空间
- 自动跳过 `.git` 和 `node_modules` 目录
- 使用系统临时目录 (`os.tmpdir()`) 存储临时文件
- 完整的错误处理和用户友好的输出
- **自动更新 `.claude-plugin/marketplace.json` 文件**，保持插件列表同步

## 相关文档

- [完整文档](./README.md)
- [主 README](../README.md)
- [Claude Code 插件开发文档](https://code.claude.com/docs/en/plugins)
