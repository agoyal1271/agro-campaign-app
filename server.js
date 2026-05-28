require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

let Client, LocalAuth;
try {
  ({ Client, LocalAuth } = require('whatsapp-web.js'));
  console.log('✅ WhatsApp module loaded');
} catch (err) {
  console.log('⚠️ WhatsApp module not available:', err.message);
  Client = null;
  LocalAuth = null;
}

const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

const messageService = require('./message-service');
const fileHandler = require('./file-handler');
const campaignMgr = require('./campaign-manager');
const safetyCheck = require('./safety-check');

let campaignState = {
  whatsappConnected: false,
  qrCode: null,
  currentCampaignId: null,
  buyers: [],
  messageTemplates: [],
  stats: {
    sent: 0,
    replies: 0,
    failed: 0,
    blocked: 0
  }
};

const QRCode = require('qrcode');

let client = null;
let qrGenerationCount = 0;

// Create WhatsApp client lazily (only when needed)
function getClient() {
  if (!client) {
    if (!Client) {
      console.error('❌ WhatsApp module not available - WhatsApp features disabled');
      return null;
    }
    console.log('Creating WhatsApp client...');
    try {
      client = new Client({
        authStrategy: new LocalAuth({ clientId: 'agro-campaign' }),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
        }
      });
    } catch (err) {
      console.error('Error creating WhatsApp client:', err.message);
      return null;
    }

    client.on('qr', async qr => {
      qrGenerationCount++;
      console.log(`📱 QR Code generated (attempt ${qrGenerationCount})`);

      if (qrGenerationCount > 3) {
        console.log('⚠️ Too many QR generation attempts - possible authentication issue');
      }

      try {
        const qrDataUrl = await QRCode.toDataURL(qr);
        campaignState.qrCode = qrDataUrl;
        console.log('✅ QR Code ready for display');
      } catch (error) {
        console.log('Error generating QR:', error.message);
      }
    });

    client.on('ready', () => {
      campaignState.whatsappConnected = true;
      qrGenerationCount = 0;
      console.log('✅ WhatsApp Connected');
    });

    client.on('disconnected', () => {
      campaignState.whatsappConnected = false;
      console.log('⚠️ WhatsApp Disconnected');
    });

    client.on('error', (err) => {
      console.log('❌ WhatsApp Client Error:', err.message);
    });

    client.on('message', async msg => {
      if (msg.fromMe) return;

      const number = msg.from.replace('@c.us', '');
      const buyer = campaignState.buyers.find(b => b.phone === number);

      if (buyer) {
        console.log(`📩 Reply from ${buyer.name}: ${msg.body}`);
        campaignState.stats.replies++;
        buyer.replied = 'yes';
        buyer.reply_message = msg.body;
      }
    });
  }
  return client;
}

app.get('/api/status', (req, res) => {
  res.json({
    whatsappConnected: campaignState.whatsappConnected,
    qrCode: campaignState.qrCode,
    stats: {
      ...campaignState.stats,
      total: campaignState.buyers.length
    },
    campaign: campaignState.currentCampaign
  });
});

app.post('/api/authorize', (req, res) => {
  if (campaignState.whatsappConnected) {
    return res.json({ success: true, message: 'Already connected' });
  }

  const whatsappClient = getClient();

  if (!whatsappClient) {
    return res.status(503).json({ error: 'WhatsApp module not available' });
  }

  if (!whatsappClient.pupBrowser) {
    whatsappClient.initialize().catch(err => {
      console.error('Failed to initialize WhatsApp:', err.message);
    });
  }

  setTimeout(() => {
    res.json({
      success: true,
      message: 'Check frontend for QR code',
      qrCode: campaignState.qrCode
    });
  }, 1000);
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await fileHandler.processFile(req.file.path, req.file.originalname);

    if (result.buyers.length > parseInt(process.env.MAX_CONTACTS_PER_UPLOAD || 1000)) {
      return res.status(400).json({
        error: `Too many contacts (${result.buyers.length}). Maximum is ${process.env.MAX_CONTACTS_PER_UPLOAD}`
      });
    }

    campaignState.buyers = result.buyers;
    campaignState.messageTemplates = result.templates;

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      buyers: result.buyers.length,
      templates: result.templates.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Campaign endpoints
app.post('/api/campaigns', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Campaign name required' });
    }

    if (!campaignState.buyers.length) {
      return res.status(400).json({ error: 'No buyers uploaded' });
    }

    if (!campaignState.messageTemplates.length) {
      return res.status(400).json({ error: 'No message templates' });
    }

    const campaign = campaignMgr.createCampaign(
      name,
      campaignState.buyers,
      campaignState.messageTemplates
    );

    campaignState.currentCampaignId = campaign.id;

    res.json({
      success: true,
      campaign: campaign,
      message: `Campaign "${name}" created successfully`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/campaigns', (req, res) => {
  try {
    const campaigns = campaignMgr.getAllCampaigns();
    res.json({ campaigns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/campaigns/:id', (req, res) => {
  try {
    const campaign = campaignMgr.getCampaignById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({ campaign });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/send', async (req, res) => {
  if (!campaignState.whatsappConnected) {
    return res.status(400).json({ error: 'WhatsApp not connected' });
  }

  if (!campaignState.currentCampaignId) {
    return res.status(400).json({ error: 'No active campaign. Create campaign first.' });
  }

  if (!campaignState.buyers.length) {
    return res.status(400).json({ error: 'No buyers in campaign' });
  }

  // SAFETY CHECK 1: Time window
  const timeCheck = safetyCheck.checkTimeWindow();
  if (!timeCheck.allowed) {
    safetyCheck.logSafetyCheck('Time Window', timeCheck);
    return res.status(400).json({ error: timeCheck.message });
  }

  // SAFETY CHECK 2: Day of week
  const dayCheck = safetyCheck.checkDayOfWeek();
  if (!dayCheck.allowed) {
    safetyCheck.logSafetyCheck('Day of Week', dayCheck);
    return res.status(400).json({ error: dayCheck.message });
  }

  const campaign = campaignMgr.getCampaignById(campaignState.currentCampaignId);
  campaignMgr.updateCampaignStatus(campaignState.currentCampaignId, 'running');

  campaignState.stats = { sent: 0, replies: 0, failed: 0, blocked: 0 };

  res.json({ success: true, message: `Campaign "${campaign.name}" started` });

  runCampaign();
});

async function runCampaign() {
  const batchSize = parseInt(process.env.BATCH_SIZE || 10);
  const minDelay = parseInt(process.env.MESSAGE_DELAY_MIN || 90000);
  const maxDelay = parseInt(process.env.MESSAGE_DELAY_MAX || 180000);
  const campaignId = campaignState.currentCampaignId;

  for (let i = 0; i < campaignState.buyers.length; i += batchSize) {
    const batch = campaignState.buyers.slice(i, i + batchSize);

    for (const buyer of batch) {
      try {
        const template = messageService.selectRandomTemplate(campaignState.messageTemplates);
        const message = messageService.personalizeMessage(template, buyer);

        const number = `${buyer.phone}@c.us`;
        const whatsappClient = getClient();

        if (!whatsappClient) {
          throw new Error('WhatsApp client not available');
        }

        await whatsappClient.sendMessage(number, message);

        buyer.status = 'sent';
        buyer.sent_at = new Date().toISOString();
        campaignState.stats.sent++;

        // Log to campaign history
        if (campaignId) {
          campaignMgr.addSentMessage(campaignId, buyer.name, buyer.phone, 'sent');
        }

        console.log(`✅ Sent to ${buyer.name}`);

        const delay = minDelay + Math.random() * (maxDelay - minDelay);
        await new Promise(r => setTimeout(r, delay));
      } catch (error) {
        buyer.status = 'failed';
        campaignState.stats.failed++;

        // Log failure to campaign history
        if (campaignId) {
          campaignMgr.addSentMessage(campaignId, buyer.name, buyer.phone, 'failed');
        }

        console.log(`❌ Failed for ${buyer.name}: ${error.message}`);
      }
    }

    // Update campaign stats
    if (campaignId) {
      campaignMgr.updateCampaignStats(campaignId, campaignState.stats);
    }

    // SAFETY CHECK 3: Failure rate
    const failureCheck = safetyCheck.checkFailureRate(
      campaignState.stats.sent,
      campaignState.stats.failed
    );
    if (!failureCheck.allowed) {
      safetyCheck.logSafetyCheck('Failure Rate', failureCheck);
      if (failureCheck.shouldPause && campaignId) {
        campaignMgr.updateCampaignStatus(campaignId, 'paused');
        console.log('🛑 Campaign auto-paused due to high failure rate');
        return;
      }
    }

    if (i + batchSize < campaignState.buyers.length) {
      const breakHours = parseInt(process.env.BATCH_BREAK_HOURS || 4);
      console.log(`⏸️  Batch break for ${breakHours} hours`);
      await new Promise(r => setTimeout(r, breakHours * 60 * 60 * 1000));
    }
  }

  if (campaignId) {
    campaignMgr.updateCampaignStatus(campaignId, 'completed');
  }

  console.log('🎉 Campaign completed');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', whatsappConnected: campaignState.whatsappConnected });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('✅ App ready - UI is accessible');
  console.log('WhatsApp will initialize when user clicks "Authorize"');
});
