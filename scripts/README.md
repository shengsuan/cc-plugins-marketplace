# 插件自动收录脚本

这个脚本用于自动化收录第三方 Claude Code 插件到市场。

## 功能

- 自动克隆 GitHub 仓库
- 验证插件结构（检查 `.claude-plugin/plugin.json`）
- 复制插件到 `external_plugins` 目录
- **自动更新 `.claude-plugin/marketplace.json` 文件**
- 自动清理临时文件
- 支持覆盖已存在的插件

## 使用方法

### 基本用法

```bash
npm run add-plugin -- --repo <github-url>
```

或

```bash
npm run add-plugin --repo=<github-url>
```

### 示例

```bash
npm run add-plugin -- --repo https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
```

### 覆盖已存在的插件

如果插件已经存在，使用 `--force` 标志来覆盖:

```bash
npm run add-plugin -- --repo <github-url> --force
```

或

```bash
npm run add-plugin --repo=<github-url> --force
```

## 插件要求

要成功收录，插件仓库必须包含:

1. `.claude-plugin/plugin.json` 文件（必需）
   - 必须包含 `name` 字段
   - 必须包含 `description` 字段
   - 可选包含 `author` 字段

2. 推荐包含:
   - `README.md` - 插件文档
   - `.mcp.json` - MCP 服务器配置（如果需要）
   - `commands/` - 斜杠命令（如果有）
   - `agents/` - 代理定义（如果有）
   - `skills/` - Skill 定义（如果有）

## 插件结构示例

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json      # 插件元数据（必填）
├── .mcp.json            # MCP 服务器配置（可选）
├── commands/            # 斜杠命令（可选）
├── agents/              # 代理定义（可选）
├── skills/              # Skill 定义（可选）
└── README.md            # 文档
```

## plugin.json 示例

```json
{
  "name": "my-plugin",
  "description": "插件的简短描述",
  "category": "development",
  "version": "1.0.0",
  "author": {
    "name": "作者名称",
    "email": "author@example.com"
  }
}
```

### 支持的字段

- `name` (必需) - 插件名称
- `description` (必需) - 插件描述
- `category` (可选) - 插件分类，如 `development`, `productivity`, `testing` 等
- `version` (可选) - 插件版本
- `author` (可选) - 作者信息
- `tags` (可选) - 标签数组，如 `["community-managed"]`

## 工作流程

1. 脚本克隆指定的 GitHub 仓库到临时目录
2. 验证插件结构和配置文件
3. 从 `plugin.json` 读取插件名称
4. 检查插件是否已存在（如果存在需要 `--force` 标志）
5. 复制插件文件到 `external_plugins/<plugin-name>/`
6. **自动更新 `.claude-plugin/marketplace.json`**，添加或更新插件条目
7. 清理临时文件
8. 显示安装命令和下一步操作

## 错误处理

脚本会在以下情况报错:

- 未提供仓库 URL
- 仓库克隆失败
- 缺少 `.claude-plugin/plugin.json` 文件
- `plugin.json` 格式错误或缺少必需字段
- 插件已存在且未使用 `--force` 标志

## 收录后步骤

插件成功添加后:

1. 检查 `external_plugins/<plugin-name>/` 目录确认文件正确
2. **检查 `.claude-plugin/marketplace.json` 文件确认插件条目已正确添加**
3. 测试插件是否正常工作
4. 提交更改到 Git 仓库

```bash
git add external_plugins/<plugin-name>
git add .claude-plugin/marketplace.json
git commit -m "添加插件: <plugin-name>"
git push
```

## 安装收录的插件

用户可以使用以下命令安装:

```bash
/plugin install <plugin-name>@claude-plugin-directory
```

或使用发现命令浏览:

```bash
/plugin > Discover
```

## 注意事项

- 脚本会自动跳过 `.git` 目录和 `node_modules` 目录
- 临时文件会在操作完成或失败后自动清理
- 建议在收录前先本地测试插件功能
