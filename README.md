# Feishu Cookie Sync Chrome Extension

A lightweight, reliable, and premium Google Chrome extension that periodically extracts your Feishu minutes cookies and securely uploads them to a designated webhook API.

## Features

- **Automated Tenant Discovery**: Automatically detects logged-in Feishu subdomains (e.g. `yourcompany.feishu.cn`) to capture relevant cookies.
- **Immediate & Recurring Sync**: Fires a synchronization task immediately upon browser startup or extension loading, then schedules a background sync every 1 hour.
- **User Dashboard Popup**:
  - Live status indicators (Active, Syncing, Idle, Error).
  - Next-sync countdown timer.
  - Manual sync trigger ("Sync Now" button).
  - Customizable subdomain override and target Webhook API.
  - Interactive activity logger (click a log entry to inspect response payloads).
- **Chrome MV3 Standard**: Uses Manifest V3 background service workers and the modern Alarms/Storage APIs.

---

## Installation & Deployment

Since this is a developer extension, you can load it directly into Chrome without downloading from the Web Store:

1. Open Google Chrome.
2. Navigate to the extension manager by visiting: `chrome://extensions/`
3. In the top-right corner, toggle **Developer mode** to ON.
4. Click the **Load unpacked** (加载已解压的扩展程序) button in the top-left.
5. Select the project directory: `/Users/rosslin/Repo/dev/FsChromeExt`
6. The extension is now loaded and running! Pin it to your Chrome toolbar for easy access.

---

## How it Works

1. **Discovery**: The extension looks for cookies matching your `feishu.cn` domains.
2. **Retrieval**: For the target subdomain (e.g. `company`), it retrieves all cookies for the URL `https://company.feishu.cn/minutes/me`.
3. **Payload**: It formats the cookies as a standard cookie string:
   ```json
   {
     "user": "company",
     "cookies": "cookie_name1=cookie_val1; cookie_name2=cookie_val2; ..."
   }
   ```
4. **Post**: Sends a `POST` request to the target API endpoint:
   `https://linatai008-n8n.hf.space/form/79319c3e-265d-4a25-a8c0-6e737bdfa53f`

---

## Options & Manual Configuration

If automatic tenant detection fails, or if you need to redirect uploads to a different webhook endpoint:

1. Click the extension icon in your toolbar.
2. Click the **Settings icon** (⚙️) next to the "Sync Now" button.
3. Modify the values:
   - **Feishu Subdomain**: Enter your tenant subdomain (e.g., enter `mycompany` for `mycompany.feishu.cn`).
   - **Webhook Endpoint API**: Customize the target webhook API URL.
4. Click **Save Configurations**. Saving automatically runs an immediate synchronization to test the new configurations.

---

## Verification & Logs

- **Dashboard Logs**: Inside the popup, click on any entry under **Recent Activity** to view the status codes, request times, or raw API response bodies.
- **Background Console**: If you need to view raw network traces or debug errors:
  1. Open `chrome://extensions/`.
  2. Locate **Feishu Cookie Sync**.
  3. Click **service worker** (inspect views) to open DevTools for the background worker.
# FeishuCookieExt
# FeishuCookieExt
# FeishuCookieExt
