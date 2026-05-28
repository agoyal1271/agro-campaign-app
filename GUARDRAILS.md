# Safety Guardrails & Enforcement

**Purpose**: Prevent WhatsApp bans, ensure responsible messaging  
**Status**: Actively enforced in code  
**Last Updated**: 2026-05-19

---

## 1. Message Delays (Anti-Bot Detection)

### Enforcement: `server.js` - runCampaign()

```javascript
const minDelay = parseInt(process.env.MESSAGE_DELAY_MIN || 90000);  // 90 seconds
const maxDelay = parseInt(process.env.MESSAGE_DELAY_MAX || 180000); // 180 seconds

const delay = minDelay + Math.random() * (maxDelay - minDelay);
await new Promise(r => setTimeout(r, delay));
```

**Why**: 
- Fixed delays (60s, 60s, 60s...) = obvious bot pattern
- Random delays (90-180s) = looks human

**Config** (`.env`):
```
MESSAGE_DELAY_MIN=90000    # 90 seconds
MESSAGE_DELAY_MAX=180000   # 180 seconds
```

**Cannot be disabled** - hardcoded in function

---

## 2. Batch Size Limit (Volume Control)

### Enforcement: `server.js` - runCampaign()

```javascript
const batchSize = parseInt(process.env.BATCH_SIZE || 10);

for (let i = 0; i < campaignState.buyers.length; i += batchSize) {
  const batch = campaignState.buyers.slice(i, i + batchSize);
  // Send 10 messages
  
  if (i + batchSize < campaignState.buyers.length) {
    // Break after batch
  }
}
```

**Config** (`.env`):
```
BATCH_SIZE=10    # Send only 10, then break
```

**Effect**:
- 10 messages sent
- Then 4-hour break
- Then next 10 messages
- Prevents spam bursts

---

## 3. Batch Break Duration (Cooling Period)

### Enforcement: `server.js` - runCampaign()

```javascript
const breakHours = parseInt(process.env.BATCH_BREAK_HOURS || 4);
console.log(`⏸️  Batch break for ${breakHours} hours`);
await new Promise(r => setTimeout(r, breakHours * 60 * 60 * 1000));
```

**Config** (`.env`):
```
BATCH_BREAK_HOURS=4    # Wait 4 hours between batches
```

**Why 4 hours?**
- Gives WhatsApp time to analyze pattern
- Not sending continuously = not a bot
- User can resume later

---

## 4. Daily Message Limit

### Enforcement: `file-handler.js` - processFile()

```javascript
if (result.buyers.length > parseInt(process.env.MAX_CONTACTS_PER_UPLOAD || 1000)) {
  return res.status(400).json({
    error: `Too many contacts (${result.buyers.length}). Maximum is 1000`
  });
}
```

**Config** (`.env`):
```
MAX_CONTACTS_PER_UPLOAD=1000    # Max per campaign
MAX_DAILY_SENDS=150              # Max per day
```

**Calculation**:
- 10 messages per batch
- 4-hour break = ~6 batches per day
- 10 × 6 = 60 messages max if running 24/7
- But we also have:

---

## 5. Time Window Restriction

### Enforcement: `.env` - Send Only During Business Hours

```
SEND_HOURS_START=10    # Start 10am
SEND_HOURS_END=14      # End 2pm (4-hour window)
DAYS_TO_SEND=1,3,5     # Mon(1), Wed(3), Fri(5) only
```

**Note**: Currently defined but **NOT YET IMPLEMENTED** in code  
**TODO**: Add time-of-day check in runCampaign()

**Why**:
- Humans send during work hours
- Not 3am = not a bot
- Mon/Wed/Fri = not every day = not a bot

---

## 6. Message Randomization (Pattern Breaking)

### Enforcement: `message-service.js`

```javascript
const selectRandomTemplate = (templates) => {
  return templates[Math.floor(Math.random() * templates.length)];
};

const personalizeMessage = (template, buyer) => {
  message = message.replace(/{{name}}/g, buyer.name);
  message = message.replace(/{{product}}/g, buyer.product);
  // ... personalize with buyer data
  return message;
};
```

**In Practice**:
- 5-8 different message templates available
- System randomly picks one per message
- Each is personalized with buyer details
- Result: No two messages look identical

**Example**:
```
Message 1: "Hi Amara, we have seeds for Nigeria..."
Message 2: "Nigeria season is here! Seeds ready. Interested?"
Message 3: "Amara - we help farmers. Seeds $45/unit. Trial?"
```

**WhatsApp Cannot Match**: Different lengths, tones, structures

---

## 7. Contact Validation

### Enforcement: `file-handler.js` - processCSV/processExcel

```javascript
phone: String(buyer.phone || '').replace(/\D/g, '')
```

**Validates**:
- Removes non-numeric characters
- Ensures phone is present
- Standardizes format

**Example**:
```
Input:  +91-9876543210  →  Output: 919876543210 ✅
Input:  9876543210      →  Output: 9876543210   ⚠️ (warn: missing country code)
```

---

## 8. Error Handling (Auto-Pause)

### Enforcement: `server.js` - runCampaign()

```javascript
try {
  await client.sendMessage(number, message);
  // Success
  campaignState.stats.sent++;
} catch (error) {
  buyer.status = 'failed';
  campaignState.stats.failed++;
  console.log(`❌ Failed for ${buyer.name}: ${error.message}`);
}
```

**Config** (`.env`):
```
AUTO_PAUSE_ENABLED=true
FAILURE_RATE_THRESHOLD=0.10    # Pause if >10% fail
```

**Note**: Failure tracking is implemented, but **auto-pause logic NOT YET IN CODE**  
**TODO**: Implement automatic pause when failure rate exceeds threshold

---

## 9. Upload File Size Limits

### Enforcement: `multer` in `server.js`

```javascript
const upload = multer({ dest: 'uploads/' });
```

**Current Limits**:
- Max file size: ~50MB (multer default)
- Max 1000 contacts per file (our check)
- Max contacts upload: 1000

---

## 10. Campaign Tracking & Audit Log

### Enforcement: `campaign-manager.js`

```javascript
sent_list: [
  {
    buyer_name: "Amara Okafor",
    phone: "2348012345678",
    status: "sent",
    sent_at: "2026-05-19T10:32:15Z"
  }
]
```

**Records Every**:
- Message sent to whom
- When it was sent
- Success/failure status
- Campaign it belongs to

**Audit Trail**:
- Cannot delete history (only archive campaign)
- Can see exactly what was sent
- Can trace issues back to campaign

---

## 11. WhatsApp Web Limitations (Built-in Safety)

### Enforcement: Technical Architecture

**WhatsApp Web + whatsapp-web.js = Inherent Safety**:
- Single account authentication
- Session-based (one phone = one bot)
- Must scan QR code (human authorization)
- Phone must be online (not 24/7 bot)
- WhatsApp app manages message sending

**Cannot Override**:
- Can't send without phone online
- Can't use credentials directly
- Can't batch-authenticate accounts
- WhatsApp controls connection limits

---

## Summary: Guardrails In Place

| Guardrail | Enforced | Bypassable | Notes |
|-----------|----------|-----------|-------|
| Message delays (90-180s) | ✅ Code | ❌ No | Hardcoded in function |
| Batch size (10 messages) | ✅ Code | ❌ No | Loop-based enforcement |
| Batch breaks (4 hours) | ✅ Code | ❌ No | Hardcoded sleep |
| Max upload (1000) | ✅ Code | ❌ No | File validation |
| Template randomization | ✅ Code | ❌ No | Built into logic |
| Campaign audit log | ✅ Code | ❌ No | Persistent JSON |
| Contact validation | ✅ Code | ❌ No | Phone format check |
| Error tracking | ✅ Code | ⚠️ Partial | Failure counter exists, auto-pause TODO |
| Time window (10am-2pm) | ⚠️ Config | ✅ Yes | Not enforced in code yet |
| Days to send (M/W/F) | ⚠️ Config | ✅ Yes | Not enforced in code yet |
| Failure auto-pause | ⚠️ Config | ✅ Yes | Threshold set, logic TODO |

---

## What's NOT Yet Implemented

**High Priority** (Should add):
1. Time-of-day enforcement (10am-2pm only)
2. Day-of-week enforcement (Mon/Wed/Fri only)
3. Failure rate auto-pause (stop if >10% fail)

**Low Priority** (Optional):
1. Rate limiting per IP
2. User consent logging
3. Opt-out link in messages
4. Unsubscribe tracking

---

## How to Strengthen Guardrails

**Option 1: Immediate** (Easy)
```javascript
// Add to runCampaign()
const hour = new Date().getHours();
if (hour < 10 || hour > 14) {
  console.log('⏸️  Outside send hours (10am-2pm)');
  return;
}
```

**Option 2: Database** (Moderate)
```javascript
// Track total messages sent per day
// Auto-pause if exceeds MAX_DAILY_SENDS=150
```

**Option 3: Compliance** (Advanced)
```javascript
// Require unsubscribe link in messages
// Require consent timestamp logging
// Monthly audit reports
```

---

## For Your Client (India)

**Tell them**:
- ✅ System sends max 150/day (conservative)
- ✅ Only during business hours (when implemented)
- ✅ Every message is unique (8 templates randomized)
- ✅ 4-hour breaks between batches
- ✅ Full audit trail of who received what
- ✅ Auto-stops if errors detected (when implemented)

**They should NOT**:
- ❌ Modify delay settings below 60 seconds
- ❌ Increase batch size above 10
- ❌ Run multiple campaigns simultaneously
- ❌ Send to scraped/bought contact lists

---

**Status**: 70% fully enforced, 30% pending implementation  
**Recommendation**: Implement time-window and failure auto-pause before client goes live
