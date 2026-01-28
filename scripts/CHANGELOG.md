# 更新日志

## v2.0.0 - 2026-01-26

### 新增功能

- **自动更新 marketplace.json**: 脚本现在会自动更新 `.claude-plugin/marketplace.json` 文件
  - 智能检测插件是否已存在
  - 如果存在则更新，不存在则添加
  - 自动提取插件元数据（name, description, category, version, author, tags）
  - 自动生成 source 和 homepage 字段
  - 保持 JSON 文件格式（2 空格缩进）

### 改进

- 更新了所有文档以反映新功能
- 添加了 MARKETPLACE_UPDATE.md 详细说明 marketplace.json 更新逻辑
- 改进了输出信息，显示 marketplace.json 更新状态

### 文档

- `scripts/README.md` - 更新了功能列表和工作流程
- `scripts/USAGE.md` - 更新了输出示例
- `scripts/MARKETPLACE_UPDATE.md` - 新增，详细说明 marketplace.json 更新机制

---

## v1.0.0 - 初始版本

### 功能

- 自动克隆 GitHub 仓库
- 验证插件结构
- 复制插件到 external_plugins 目录
- 自动清理临时文件
- 支持覆盖已存在的插件 (--force)
- 友好的彩色终端输出
- 完整的错误处理
