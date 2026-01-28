# marketplace.json 自动更新说明

## 概述

`add-plugin.js` 脚本会自动更新 `.claude-plugin/marketplace.json` 文件，将新添加的插件信息同步到市场配置中。

## 更新逻辑

### 1. 读取插件信息

脚本从插件的 `.claude-plugin/plugin.json` 文件中读取以下信息:

- `name` - 插件名称（必需）
- `description` - 插件描述（必需）
- `category` - 插件分类（可选，默认为 "development"）
- `version` - 插件版本（可选）
- `author` - 作者信息（可选）
- `tags` - 标签数组（可选）

### 2. 构建 marketplace 条目

脚本会自动构建以下格式的条目:

```json
{
  "name": "plugin-name",
  "description": "插件描述",
  "category": "development",
  "source": "./external_plugins/plugin-name",
  "homepage": "https://github.com/user/repo",
  "version": "1.0.0",
  "author": {
    "name": "作者名称",
    "email": "author@example.com"
  },
  "tags": ["community-managed"]
}
```

### 3. 更新或添加

- **如果插件已存在**: 更新现有条目
- **如果插件不存在**: 添加到 `plugins` 数组末尾

### 4. 保持格式

脚本使用 `JSON.stringify(data, null, 2)` 保持 2 空格缩进的格式。

## marketplace.json 结构

```json
{
  "name": "cc-plugins-marketplace",
  "description": "热门 Claude Code 扩展程序目录",
  "owner": {
    "name": "ShengSuanYun",
    "email": "1257817341@qq.com"
  },
  "plugins": [
    {
      "name": "plugin-1",
      "description": "插件 1 描述",
      "category": "development",
      "source": "./external_plugins/plugin-1",
      "homepage": "https://github.com/..."
    },
    {
      "name": "plugin-2",
      "description": "插件 2 描述",
      "category": "productivity",
      "source": "./external_plugins/plugin-2",
      "homepage": "https://github.com/..."
    }
  ]
}
```

## 字段映射

| plugin.json 字段 | marketplace.json 字段 | 处理方式 |
|-----------------|----------------------|---------|
| `name` | `name` | 直接复制 |
| `description` | `description` | 直接复制 |
| `category` | `category` | 直接复制，默认为 "development" |
| `version` | `version` | 可选，如果存在则复制 |
| `author` | `author` | 可选，如果存在则复制 |
| `tags` | `tags` | 可选，如果存在则复制 |
| - | `source` | 自动生成为 `./external_plugins/{name}` |
| - | `homepage` | 使用 GitHub 仓库 URL |

## 支持的分类 (category)

根据现有的 marketplace.json，支持以下分类:

- `development` - 开发工具
- `productivity` - 效率工具
- `testing` - 测试工具
- `security` - 安全工具
- `database` - 数据库工具
- `deployment` - 部署工具
- `monitoring` - 监控工具
- `design` - 设计工具
- `learning` - 学习工具

## 推荐的 plugin.json 配置

为了获得最佳的 marketplace 条目，建议在插件的 `plugin.json` 中包含以下字段:

```json
{
  "name": "my-awesome-plugin",
  "description": "简洁明了的插件描述（建议不超过 100 字）",
  "category": "development",
  "version": "1.0.0",
  "author": {
    "name": "你的名字",
    "email": "your@email.com"
  },
  "tags": ["community-managed"]
}
```

## 手动调整

如果需要更复杂的配置（例如 `lspServers`、特殊的 `source` 配置等），可以在脚本运行后手动编辑 `.claude-plugin/marketplace.json` 文件。

### 示例：添加 LSP 配置

```json
{
  "name": "my-lsp-plugin",
  "description": "自定义 LSP 插件",
  "category": "development",
  "source": "./external_plugins/my-lsp-plugin",
  "homepage": "https://github.com/user/repo",
  "lspServers": {
    "my-lsp": {
      "command": "my-lsp-server",
      "args": ["--stdio"],
      "extensionToLanguage": {
        ".xyz": "mylang"
      }
    }
  }
}
```

### 示例：使用 URL 源

如果插件需要从 URL 安装:

```json
{
  "name": "external-plugin",
  "description": "外部插件",
  "category": "productivity",
  "source": {
    "source": "url",
    "url": "https://github.com/user/repo.git"
  },
  "homepage": "https://github.com/user/repo"
}
```

## 验证

在提交前，建议验证 JSON 文件的格式:

```bash
# 使用 jq 验证 JSON 格式
cat .claude-plugin/marketplace.json | jq . > /dev/null

# 或使用 Node.js
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json', 'utf8'))"
```

## 常见问题

### Q: 脚本会覆盖我手动添加的字段吗？

A: 是的，如果使用 `--force` 重新添加插件，脚本会覆盖整个条目。建议在重新运行前备份手动修改的内容。

### Q: 如何添加多语言描述？

A: 目前脚本只支持单一描述字段。如需多语言支持，需要手动编辑 marketplace.json。

### Q: 为什么我的分类没有生效？

A: 确保在 plugin.json 中正确设置了 `category` 字段，并且值是支持的分类之一。

## 相关文件

- `scripts/add-plugin.js` - 主脚本
- `.claude-plugin/marketplace.json` - 市场配置文件
- `{plugin}/.claude-plugin/plugin.json` - 插件配置文件
