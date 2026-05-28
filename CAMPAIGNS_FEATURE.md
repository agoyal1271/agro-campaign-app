# Campaign Management Feature

**Added**: Campaign naming and tracking system  
**Date**: 2026-05-19  
**Status**: Ready for deployment

---

## What Was Added

### 1. Campaign Manager Module (`campaign-manager.js`)

Handles all campaign operations:

```javascript
createCampaign(name, buyers, templates)    // Create new campaign
getAllCampaigns()                           // List all campaigns
getCampaignById(id)                        // Get specific campaign
updateCampaignStatus(id, status)           // Update status
updateCampaignStats(id, stats)             // Update stats
addSentMessage(id, name, phone, status)    // Log sent message
deleteCampaign(id)                         // Delete campaign
archiveCampaign(id)                        // Archive campaign
```

**Storage**: `campaigns.json` file (persistent across restarts)

---

### 2. Backend API Endpoints

**POST `/api/campaigns`** - Create new campaign
```json
Request: { "name": "India - May 2026" }
Response: { "success": true, "campaign": {...} }
```

**GET `/api/campaigns`** - List all campaigns
```json
Response: {
  "campaigns": [
    {
      "id": "1234567890",
      "name": "India - May 2026",
      "status": "completed",
      "stats": {
        "total": 50,
        "sent": 48,
        "replies": 12,
        "failed": 2,
        "blocked": 0
      },
      "sent_list": [...]
    }
  ]
}
```

**GET `/api/campaigns/:id`** - Get specific campaign details

---

### 3. Campaign Data Structure

```json
{
  "id": "1717750400000",
  "name": "Nigeria - March 2026",
  "created_at": "2026-05-19T10:30:00Z",
  "status": "completed",
  "buyers": [...],
  "templates": [...],
  "stats": {
    "total": 50,
    "sent": 45,
    "replies": 8,
    "failed": 5,
    "blocked": 0
  },
  "sent_list": [
    {
      "buyer_name": "Amara Okafor",
      "phone": "2348012345678",
      "status": "sent",
      "sent_at": "2026-05-19T10:32:15Z"
    }
  ]
}
```

---

### 4. Frontend Updates

**New Campaign Management Section**
- Located at the top (before authorization)
- Shows: Current campaign input + Previous campaigns list

**Campaign Creation**
```
[Enter campaign name]  [Create Campaign]
```

**Campaign History Table**
```
Campaign Name           Date        Buyers   Sent   Replies   Status
Nigeria - March 2026    05/19/2026  50       45     8         Completed
India - May 2026        05/19/2026  100      92     15        Running
```

**Campaign Status Values**
- `draft` - Created but not started
- `running` - Currently sending messages
- `paused` - Paused mid-send
- `completed` - All messages sent
- `archived` - Old campaign

---

## Workflow with Campaigns

### Old Workflow:
```
1. Authorize WhatsApp
2. Upload File
3. Start Campaign
4. No history tracking
```

### New Workflow:
```
1. Name your campaign ("India Buyers - May 2026")
2. Authorize WhatsApp
3. Upload File
4. Create Campaign (saves with name + metadata)
5. Start Campaign
6. View campaign history and stats
7. See detailed sent_list per campaign
```

---

## Files Modified

| File | Changes |
|------|---------|
| `server.js` | Added campaign API endpoints, integrated campaignMgr |
| `public/index.html` | Added campaign management section |
| `public/style.css` | Added campaign styling |
| `public/script.js` | Added campaign functions (create, load) |

## Files Created

| File | Purpose |
|------|---------|
| `campaign-manager.js` | Campaign CRUD operations + storage |
| `CAMPAIGNS_FEATURE.md` | This documentation |

## Files Unchanged

- `message-service.js`
- `file-handler.js`
- `.env.example`
- `package.json`

---

## Database Schema (campaigns.json)

```json
[
  {
    "id": "timestamp",
    "name": "Campaign Name",
    "created_at": "ISO timestamp",
    "status": "draft|running|paused|completed|archived",
    "buyers": [{...}],
    "templates": [{...}],
    "stats": {...},
    "sent_list": [...]
  }
]
```

---

## Usage Examples

### Create Campaign
```javascript
const campaign = campaignMgr.createCampaign(
  "Nigeria - May 2026",
  buyersArray,
  templatesArray
);
// Returns campaign with id, status: 'draft'
```

### Track Message Sent
```javascript
campaignMgr.addSentMessage(
  campaignId,
  "Amara Okafor",
  "2348012345678",
  "sent"
);
```

### Update Stats
```javascript
campaignMgr.updateCampaignStats(campaignId, {
  total: 50,
  sent: 25,
  replies: 5,
  failed: 0,
  blocked: 0
});
```

---

## Benefits

✅ **Track Multiple Campaigns** - Each campaign has its own history  
✅ **Persistent Data** - Campaigns saved to `campaigns.json`  
✅ **Campaign Analytics** - See sent count, reply count per campaign  
✅ **Easy Naming** - Know which campaign is which (e.g., "India May", "Nigeria June")  
✅ **Message History** - See exactly which contacts received messages  
✅ **Status Tracking** - Know if campaign is draft/running/completed  

---

## Testing Checklist

- [ ] Server restarts without errors
- [ ] Campaign creation works
- [ ] Campaign appears in list
- [ ] File upload still works after campaign created
- [ ] Messages send correctly
- [ ] Stats update in real-time
- [ ] `campaigns.json` file created
- [ ] Campaign data persists after restart
- [ ] Multiple campaigns can be created
- [ ] Campaign history shows correct info

---

## Next Steps

1. **Restart server**: `npm start`
2. **Test campaign creation**: Enter name, click "Create Campaign"
3. **Upload file**: Should work as before
4. **Send campaign**: Click "START CAMPAIGN"
5. **Verify**: Check `campaigns.json` for saved campaign data

---

**Ready to deploy once server is restarted!** 🚀
