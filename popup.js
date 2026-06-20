document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const lastSyncTimeEl = document.getElementById('last-sync-time');
  const syncModeEl = document.getElementById('sync-mode');
  const activeSubdomainEl = document.getElementById('active-subdomain');
  const syncStatusBadge = document.getElementById('sync-status-badge');
  
  const syncBtn = document.getElementById('sync-btn');
  const syncSpinner = document.getElementById('sync-spinner');
  const settingsToggleBtn = document.getElementById('settings-toggle-btn');
  const settingsSection = document.getElementById('settings-section');
  
  const subdomainInput = document.getElementById('subdomain-input');
  const apiUrlInput = document.getElementById('api-url-input');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  
  const logListEl = document.getElementById('log-list');
  const logEmptyEl = document.getElementById('log-empty');
  const clearLogsBtn = document.getElementById('clear-logs-btn');

  // Load configuration and sync history
  async function loadData() {
    try {
      const data = await chrome.storage.local.get([
        'config', 'logs', 'lastSyncTime', 'lastSyncSuccess'
      ]);

      // 1. Populate configuration fields
      const config = data.config || {};
      subdomainInput.value = config.subdomain || '';
      apiUrlInput.value = config.apiUrl || 'https://ross008-n8n.hf.space/form/94255bd7-8f4a-44a4-b101-12b82b17a8b0';

      // 2. Display subdomain status
      if (config.subdomain) {
        activeSubdomainEl.textContent = config.subdomain;
      } else {
        activeSubdomainEl.textContent = 'Not Configured';
      }

      // 3. Display sync state and badge
      if (data.lastSyncTime) {
        lastSyncTimeEl.textContent = formatDateTime(data.lastSyncTime);
        if (data.lastSyncSuccess) {
          syncStatusBadge.textContent = 'Active';
          syncStatusBadge.className = 'status-badge status-active';
        } else {
          syncStatusBadge.textContent = 'Error';
          syncStatusBadge.className = 'status-badge status-error';
        }
      } else {
        lastSyncTimeEl.textContent = 'Never';
        syncStatusBadge.textContent = 'Idle';
        syncStatusBadge.className = 'status-badge status-idle';
      }

      // 4. Display sync mode
      if (syncModeEl) {
        syncModeEl.textContent = 'Manual';
      }

      // 5. Render Logs
      renderLogs(data.logs || []);

    } catch (e) {
      console.error('Error loading data in popup', e);
    }
  }

  // Render logs helper
  function renderLogs(logs) {
    // Clear list
    const existingItems = logListEl.querySelectorAll('.log-item');
    existingItems.forEach(item => item.remove());

    if (logs.length === 0) {
      logEmptyEl.classList.remove('hidden');
      return;
    }

    logEmptyEl.classList.add('hidden');

    logs.forEach(log => {
      const item = document.createElement('div');
      item.className = `log-item log-${log.type}`;
      
      const header = document.createElement('div');
      header.className = 'log-item-header';
      
      const msg = document.createElement('span');
      msg.className = 'log-msg';
      msg.textContent = log.message;
      
      const time = document.createElement('span');
      time.className = 'log-time';
      time.textContent = formatTimeShort(log.timestamp);
      
      header.appendChild(msg);
      header.appendChild(time);
      item.appendChild(header);

      // If details exist, prepare collapsible panel
      if (log.details) {
        const details = document.createElement('pre');
        details.className = 'log-details hidden';
        details.textContent = typeof log.details === 'object' 
          ? JSON.stringify(log.details, null, 2) 
          : log.details;
        item.appendChild(details);

        // Click to toggle details
        item.addEventListener('click', () => {
          details.classList.toggle('hidden');
        });
      }

      logListEl.appendChild(item);
    });
  }



  // Toggle Settings section
  settingsToggleBtn.addEventListener('click', () => {
    settingsSection.classList.toggle('collapsed');
  });

  // Save configurations
  saveSettingsBtn.addEventListener('click', async () => {
    const subdomain = subdomainInput.value.trim();
    const apiUrl = apiUrlInput.value.trim();

    if (!subdomain) {
      alert('Please enter a Feishu subdomain.');
      return;
    }

    if (apiUrl && !apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      alert('Please enter a valid API URL starting with http:// or https://');
      return;
    }

    saveSettingsBtn.disabled = true;
    saveSettingsBtn.textContent = 'Saving...';

    try {
      await chrome.storage.local.set({
        config: { subdomain, apiUrl }
      });
      
      // Auto trigger a sync upon saving configuration to verify it immediately
      triggerSync();
      
      // Collapse settings section
      setTimeout(() => {
        settingsSection.classList.add('collapsed');
        saveSettingsBtn.disabled = false;
        saveSettingsBtn.textContent = 'Save Configurations';
      }, 500);
    } catch (e) {
      console.error(e);
      alert('Failed to save settings.');
      saveSettingsBtn.disabled = false;
      saveSettingsBtn.textContent = 'Save Configurations';
    }
  });

  // Trigger Sync function
  function triggerSync() {
    syncBtn.disabled = true;
    syncSpinner.classList.remove('hidden');
    const oldBadgeText = syncStatusBadge.textContent;
    const oldBadgeClass = syncStatusBadge.className;
    
    syncStatusBadge.textContent = 'Syncing';
    syncStatusBadge.className = 'status-badge status-syncing';

    chrome.runtime.sendMessage({ type: 'FORCE_SYNC' }, (response) => {
      syncBtn.disabled = false;
      syncSpinner.classList.add('hidden');
      
      if (chrome.runtime.lastError) {
        console.error('Runtime error:', chrome.runtime.lastError);
        syncStatusBadge.textContent = 'Error';
        syncStatusBadge.className = 'status-badge status-error';
        loadData();
        return;
      }

      loadData();
    });
  }

  // Bind Manual Sync Button
  syncBtn.addEventListener('click', triggerSync);

  // Clear Logs
  clearLogsBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear sync logs?')) {
      await chrome.storage.local.set({ logs: [] });
      loadData();
    }
  });

  // Listen for logs updates from background in real-time
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'LOGS_UPDATED') {
      loadData();
    }
  });

  // Date utilities
  function formatDateTime(isoString) {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  }

  function formatTimeShort(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${hh}:${mm}:${ss}`;
  }

  // Load on start
  loadData();
});
