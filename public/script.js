let campaignState = {
  whatsappConnected: false,
  fileUploaded: false,
  campaignRunning: false,
  currentCampaignId: null,
  currentCampaignName: null,
  stats: { sent: 0, replies: 0, failed: 0, blocked: 0, total: 0 }
};

const API_BASE = 'http://localhost:3000/api';

async function checkStatus() {
  try {
    const response = await fetch(`${API_BASE}/status?t=${Date.now()}`, {
      cache: 'no-cache'
    });
    const data = await response.json();

    campaignState.whatsappConnected = data.whatsappConnected;
    updateStatusUI();

    if (data.qrCode && !campaignState.whatsappConnected) {
      showQRCode(data.qrCode);
    }

    if (data.stats) {
      campaignState.stats = data.stats;
      updateStatsUI();
    }
  } catch (error) {
    console.log('Status check - server may not be ready yet');
  }
}

function updateStatusUI() {
  const badge = document.getElementById('whatsappStatus');
  if (campaignState.whatsappConnected) {
    badge.textContent = 'Connected ✅';
    badge.classList.add('connected');
    document.getElementById('authorizeBtn').disabled = true;
    document.getElementById('authorizeBtn').textContent = 'Connected';
  } else {
    badge.textContent = 'Disconnected';
    badge.classList.remove('connected');
    document.getElementById('authorizeBtn').disabled = false;
    document.getElementById('authorizeBtn').textContent = 'Authorize WhatsApp';
  }
}

async function authorize() {
  const number = document.getElementById('whatsappNumber').value.trim();

  if (!number) {
    alert('Please enter your WhatsApp number');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsappNumber: number })
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById('qrContainer').style.display = 'block';
      document.getElementById('authorizeBtn').disabled = true;

      let attempts = 0;
      const checkQR = setInterval(() => {
        checkStatus();
        attempts++;

        if (campaignState.whatsappConnected) {
          clearInterval(checkQR);
          document.getElementById('qrContainer').style.display = 'none';
          document.getElementById('successMessage').style.display = 'block';
          document.getElementById('step2').style.opacity = '1';
          document.getElementById('fileInput').disabled = false;
        }

        if (attempts > 30) {
          clearInterval(checkQR);
          alert('QR code timeout. Please try again.');
          document.getElementById('qrContainer').style.display = 'none';
          document.getElementById('authorizeBtn').disabled = false;
        }
      }, 2000);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  document.getElementById('fileStatus').style.display = 'none';
  document.getElementById('fileError').style.display = 'none';

  fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        showError(data.error);
      } else {
        campaignState.fileUploaded = true;
        document.getElementById('buyerCount').textContent = data.buyers + ' buyers';
        document.getElementById('templateCount').textContent = data.templates + ' templates';
        document.getElementById('fileStatus').style.display = 'block';
        campaignState.stats.total = data.buyers;
        document.getElementById('startBtn').disabled = false;
      }
    })
    .catch(error => showError(error.message));
}

function showError(message) {
  const errorBox = document.getElementById('fileError');
  errorBox.textContent = '❌ ' + message;
  errorBox.style.display = 'block';
}

function startCampaign() {
  if (!campaignState.whatsappConnected || !campaignState.fileUploaded) {
    alert('Please authorize WhatsApp and upload a file first');
    return;
  }

  campaignState.campaignRunning = true;
  document.getElementById('startBtn').disabled = true;
  document.getElementById('startBtn').textContent = 'Campaign Running...';

  fetch(`${API_BASE}/send`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const statusCheck = setInterval(() => {
          checkStatus();
          const progress = (campaignState.stats.sent / campaignState.stats.total) * 100;
          document.getElementById('progressBar').style.width = progress + '%';
          document.getElementById('progressText').textContent =
            `${campaignState.stats.sent}/${campaignState.stats.total} sent | ${campaignState.stats.replies} replies`;
        }, 2000);

        setTimeout(() => {
          clearInterval(statusCheck);
          campaignState.campaignRunning = false;
          document.getElementById('startBtn').disabled = false;
          document.getElementById('startBtn').textContent = 'Campaign Complete!';
        }, 300000);
      }
    })
    .catch(error => {
      alert('Error starting campaign: ' + error.message);
      campaignState.campaignRunning = false;
      document.getElementById('startBtn').disabled = false;
    });
}

function updateStatsUI() {
  document.getElementById('sentCount').textContent = campaignState.stats.sent;
  document.getElementById('replyCount').textContent = campaignState.stats.replies;
  document.getElementById('failedCount').textContent = campaignState.stats.failed;
  document.getElementById('totalCount').textContent = campaignState.stats.total;
}

function showQRCode(qrDataUrl) {
  const container = document.getElementById('qrCode');
  container.innerHTML = '';

  const img = document.createElement('img');
  img.src = qrDataUrl;
  img.alt = 'WhatsApp QR Code';
  img.style.maxWidth = '250px';
  img.style.border = '2px solid #2d5016';
  img.style.borderRadius = '8px';

  container.appendChild(img);
}

function downloadTemplate() {
  const template = `name,phone,country,product,price_usd,moq,region_hook
Amara Okafor,2348012345678,Nigeria,Hybrid Seeds,45,10,Built for West African soil
Kwame Mensah,233244567890,Ghana,Sorghum Seeds,38,15,Trusted by Ghana's top distributors
Priya Sharma,919876543210,India,Wheat Seeds,32,20,Monsoon-ready stock`;

  const link = document.createElement('a');
  link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(template);
  link.download = 'buyers_template.csv';
  link.click();
}

// Campaign Management
async function createCampaign() {
  const campaignName = document.getElementById('campaignName').value.trim();

  if (!campaignName) {
    showCampaignStatus('Please enter a campaign name', true);
    return;
  }

  if (!campaignState.fileUploaded) {
    showCampaignStatus('Upload buyer file first', true);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: campaignName })
    });

    const data = await response.json();

    if (data.success) {
      campaignState.currentCampaignId = data.campaign.id;
      campaignState.currentCampaignName = campaignName;
      showCampaignStatus(`✅ Campaign "${campaignName}" created!`);
      document.getElementById('campaignName').value = '';
      loadCampaigns();
      document.getElementById('startBtn').disabled = false;
    } else {
      showCampaignStatus(data.error, true);
    }
  } catch (error) {
    showCampaignStatus(error.message, true);
  }
}

function showCampaignStatus(message, isError = false) {
  const statusEl = document.getElementById('campaignStatus');
  statusEl.textContent = message;
  statusEl.className = isError ? 'campaign-status error' : 'campaign-status';
  statusEl.style.display = 'block';
}

async function loadCampaigns() {
  try {
    const response = await fetch(`${API_BASE}/campaigns?t=${Date.now()}`, {
      cache: 'no-cache',
      headers: { 'pragma': 'no-cache' }
    });
    const data = await response.json();

    const campaignsList = document.getElementById('campaignsList');

    if (!data.campaigns || data.campaigns.length === 0) {
      campaignsList.innerHTML = '<p class="no-campaigns">No campaigns yet</p>';
      return;
    }

    campaignsList.innerHTML = data.campaigns.map(campaign => `
      <div class="campaign-item">
        <div class="campaign-item-info">
          <div class="campaign-item-name">${campaign.name}</div>
          <div class="campaign-item-meta">
            <span>📅 ${new Date(campaign.created_at).toLocaleDateString()}</span>
            <span>👥 ${campaign.stats.total} buyers</span>
            <span>✅ ${campaign.stats.sent} sent</span>
            <span>💬 ${campaign.stats.replies} replies</span>
          </div>
        </div>
        <div class="campaign-item-status ${campaign.status}">
          ${campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.log('Error loading campaigns:', error);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setInterval(checkStatus, 1000);
  checkStatus();
  loadCampaigns();
  setInterval(loadCampaigns, 10000);
});

// Drag and drop
const dropZone = document.getElementById('dropZone');
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
  dropZone.style.borderColor = 'var(--accent)';
  dropZone.style.background = '#fffbf3';
}

function unhighlight(e) {
  dropZone.style.borderColor = 'var(--primary)';
  dropZone.style.background = '#f8faf6';
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  document.getElementById('fileInput').files = files;
  handleFileSelect({ target: { files: files } });
}
