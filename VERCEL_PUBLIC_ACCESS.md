# 让 Vercel 部署公开访问

## 🎯 目标

让 https://web-j3mib71wh-ezcat207s-projects.vercel.app 变成公开访问，不需要登录。

---

## 📋 方法 1: Vercel Dashboard（最快，2分钟）

### 步骤：

1. **打开项目设置**
   ```
   https://vercel.com/ezcat207s-projects/web/settings
   ```

2. **找到 "Deployment Protection"**
   - 在左侧菜单找到 "Deployment Protection"
   - 或者直接访问：
     ```
     https://vercel.com/ezcat207s-projects/web/settings/deployment-protection
     ```

3. **选择保护级别**

   选项说明：
   ```
   ○ Standard Protection          ← 当前（需要登录）❌
   ○ Only Preview Deployments     ← 推荐！✅
   ○ All Deployments
   ○ None
   ```

   **推荐选择：** `Only Preview Deployments`
   - Production 部署公开访问 ✅
   - Preview 部署仍需登录（保护测试版本）

4. **保存设置**
   - 点击 "Save"
   - 等待几秒

5. **测试访问**
   - 打开隐身窗口（Incognito）
   - 访问 https://web-j3mib71wh-ezcat207s-projects.vercel.app
   - 应该能直接看到网站，不需要登录 ✅

---

## 📋 方法 2: Vercel CLI（如果 Dashboard 无法访问）

```bash
# 1. 获取 API Token
# 访问: https://vercel.com/account/tokens
# 创建新 token，复制后运行：

export VERCEL_TOKEN="your_token_here"

# 2. 获取 Project ID
vercel project inspect --cwd web --yes | grep "ID"

# 3. 调用 API 关闭保护
# 将 PROJECT_ID 替换为上一步的实际 ID
curl -X PATCH \
  "https://api.vercel.com/v9/projects/PROJECT_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"protection": {"mode": "preview"}}'
```

---

## 📋 方法 3: 重新部署到新项目（最干净）

```bash
# 1. 删除现有项目链接
cd /Volumes/Lexar/oneweekoneproject/001cli/notebooklm-web/web
rm -rf .vercel

# 2. 重新部署（会创建新项目）
vercel --prod --yes

# 3. 新项目默认是公开的（如果团队没有强制 SSO）
```

---

## ✅ 验证是否成功

### 测试 1: 隐身窗口
```
1. 打开 Chrome 隐身窗口 (Cmd+Shift+N / Ctrl+Shift+N)
2. 访问你的部署 URL
3. 应该直接看到网站，不要求登录
```

### 测试 2: curl
```bash
curl -I https://web-j3mib71wh-ezcat207s-projects.vercel.app

# 应该返回：
# HTTP/2 200 ✅
#
# 而不是：
# HTTP/2 401 ❌
```

### 测试 3: 分享给朋友
```
1. 把 URL 发给没有你 Vercel 账号权限的人
2. 他们应该能直接打开
```

---

## 🔍 为什么会有 SSO 保护？

可能原因：
1. **团队级别的默认设置** - "ezcat207's projects" 可能启用了团队 SSO
2. **项目级别的保护** - 项目创建时自动启用了保护

解决：
- 方法 1 会在**项目级别**关闭保护
- 如果不行，需要在**团队设置**里关闭默认 SSO

---

## 🆘 如果还是不行

### 检查团队设置

1. 访问团队设置：
   ```
   https://vercel.com/teams/ezcat207s-projects/settings
   ```

2. 找到 "Deployment Protection" 或 "Security" 设置

3. 检查是否有强制所有项目启用保护的选项

4. 关闭它

---

## 📝 完成后的 URL

成功后，这些 URL 都应该公开访问：

```
✅ Production: https://web-j3mib71wh-ezcat207s-projects.vercel.app
✅ 或更好看的域名（如果配置了）: https://notebooklm-web.vercel.app
```

---

## 🎯 下一步

成功后，告诉我，我们可以：

1. ✅ 配置更好看的域名
2. ✅ 添加 "安装扩展" 引导页面
3. ✅ 清理 Dashboard UI
4. ✅ 准备分享给用户

---

**预计时间：2-5 分钟**
