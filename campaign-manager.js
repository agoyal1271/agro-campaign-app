const fs = require('fs');
const path = require('path');

const CAMPAIGNS_FILE = 'campaigns.json';

// Load campaigns from file
const loadCampaigns = () => {
  try {
    if (fs.existsSync(CAMPAIGNS_FILE)) {
      const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Creating new campaigns file');
  }
  return [];
};

// Save campaigns to file
const saveCampaigns = (campaigns) => {
  fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
};

// Create new campaign
const createCampaign = (name, buyers, templates) => {
  const campaigns = loadCampaigns();

  const campaign = {
    id: Date.now().toString(),
    name: name,
    created_at: new Date().toISOString(),
    status: 'draft', // draft, running, paused, completed
    buyers: buyers,
    templates: templates,
    stats: {
      total: buyers.length,
      sent: 0,
      replies: 0,
      failed: 0,
      blocked: 0
    },
    sent_list: []
  };

  campaigns.push(campaign);
  saveCampaigns(campaigns);

  return campaign;
};

// Get all campaigns
const getAllCampaigns = () => {
  return loadCampaigns();
};

// Get campaign by ID
const getCampaignById = (campaignId) => {
  const campaigns = loadCampaigns();
  return campaigns.find(c => c.id === campaignId);
};

// Update campaign status
const updateCampaignStatus = (campaignId, status) => {
  const campaigns = loadCampaigns();
  const campaign = campaigns.find(c => c.id === campaignId);
  if (campaign) {
    campaign.status = status;
    saveCampaigns(campaigns);
  }
  return campaign;
};

// Update campaign stats
const updateCampaignStats = (campaignId, stats) => {
  const campaigns = loadCampaigns();
  const campaign = campaigns.find(c => c.id === campaignId);
  if (campaign) {
    campaign.stats = stats;
    saveCampaigns(campaigns);
  }
  return campaign;
};

// Add sent message to campaign
const addSentMessage = (campaignId, buyerName, phone, status) => {
  const campaigns = loadCampaigns();
  const campaign = campaigns.find(c => c.id === campaignId);
  if (campaign) {
    campaign.sent_list.push({
      buyer_name: buyerName,
      phone: phone,
      status: status,
      sent_at: new Date().toISOString()
    });
    saveCampaigns(campaigns);
  }
  return campaign;
};

// Delete campaign
const deleteCampaign = (campaignId) => {
  let campaigns = loadCampaigns();
  campaigns = campaigns.filter(c => c.id !== campaignId);
  saveCampaigns(campaigns);
  return true;
};

// Archive campaign
const archiveCampaign = (campaignId) => {
  return updateCampaignStatus(campaignId, 'archived');
};

module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaignStatus,
  updateCampaignStats,
  addSentMessage,
  deleteCampaign,
  archiveCampaign,
  loadCampaigns,
  saveCampaigns
};
