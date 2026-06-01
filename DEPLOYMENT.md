# Deployment Information

## 🌐 Live Websites

### Production Web UI
**URL**: https://web-j3mib71wh-ezcat207s-projects.vercel.app

**Status**: ✅ Live on Vercel

**Note**: This is a Chrome Extension companion web UI. It requires the NotebookLM Web Chrome Extension to be installed to function properly.

### Alternative URLs
- Previous deployment: https://web-n1z2b2fgp-ezcat207s-projects.vercel.app

## 🔧 How to Use the Web UI

### Prerequisites

1. **Install Chrome Extension First**
   - Load the extension from `chrome-extension/` directory
   - Or install from Chrome Web Store (when published)

2. **Login to NotebookLM**
   - Visit https://notebooklm.google.com
   - Login with your Google account

3. **Open the Web UI**
   - Visit the deployment URL above
   - The web UI will automatically connect to the extension

## 📦 Deployment Commands

### Deploy to Production

```bash
# From project root
vercel --prod --cwd web

# Or from web directory
cd web
vercel --prod
```

### Deploy to Preview

```bash
cd web
vercel
```

### Check Deployment Status

```bash
vercel ls --cwd web
```

### View Logs

```bash
vercel logs <deployment-url>
```

## 🏗️ Architecture

```
┌─────────────────────┐
│  User's Browser     │
│  ┌───────────────┐  │
│  │  Web UI       │◄─┼── HTTPS ── Vercel
│  │  (Next.js)    │  │
│  └───────┬───────┘  │
│          │          │
│          │ chrome   │
│          │ runtime  │
│          ▼ messages │
│  ┌───────────────┐  │
│  │  Extension    │  │
│  │  (Background) │  │
│  └───────┬───────┘  │
│          │          │
└──────────┼──────────┘
           │
           │ RPC calls
           ▼
   ┌───────────────────┐
   │  NotebookLM API   │
   │  (Google)         │
   └───────────────────┘
```

## 🧪 Testing the Deployment

### Test Extension Integration

1. Install the Chrome Extension
2. Visit the web UI URL
3. Open browser console (F12)
4. Check for connection messages:
   ```
   ✅ Connected to NotebookLM Extension
   ```

### Test Basic Functionality

In the web UI:
1. Click "Batch Operations"
2. Try listing notebooks
3. Try creating a studio artifact

## 🔒 Security Considerations

### CORS and Extension Messages

The web UI communicates with the extension via `chrome.runtime.sendMessage`. This requires:

1. The extension manifest includes the web UI domain in `externally_connectable`
2. The web UI uses the correct extension ID

### Current Configuration

Check `chrome-extension/manifest.json`:

```json
{
  "externally_connectable": {
    "matches": [
      "https://web-j3mib71wh-ezcat207s-projects.vercel.app/*",
      "https://*.vercel.app/*",
      "http://localhost:*/*"
    ]
  }
}
```

## 📝 Environment Variables

The web UI doesn't require environment variables as it relies on the Chrome Extension for all API communication.

## 🚀 Future Improvements

- [ ] Custom domain (e.g., notebooklm-web.com)
- [ ] Analytics integration
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] A/B testing setup

## 🔄 Continuous Deployment

### Automatic Deployment via Git

Vercel automatically deploys:
- **Production**: On push to `main` branch
- **Preview**: On pull requests

### Manual Deployment

Use the Vercel CLI as shown above.

## 📞 Support

If the deployment has issues:

1. Check Vercel dashboard: https://vercel.com/ezcat207s-projects/web
2. View deployment logs: `vercel logs <url>`
3. Check extension connection in browser console
4. Verify Chrome Extension is loaded and active

---

**Last Updated**: 2026-06-01
**Deployed By**: Claude Code via Happy
