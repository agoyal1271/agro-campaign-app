# Ganesh Agro Campaign Manager

A local WhatsApp campaign management application for sending personalized messages to agricultural buyers.

**⚠️ IMPORTANT: Everything runs locally on your machine. No data sent to external servers.**

---

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/architgoyal/agro-campaign-app
npm install
```

This will install:
- Express (web server)
- whatsapp-web.js (WhatsApp automation)
- xlsx (Excel file processing)
- And other utilities

### 2. Set Up Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` if you want to customize settings (optional).

### 3. Start the App

```bash
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
```

### 4. Open in Browser

Go to: **http://localhost:3000**

You'll see the Ganesh Agro Campaign Manager interface.

---

## How to Use

### Step 1: Authorize WhatsApp

1. Enter your WhatsApp number (with country code, e.g., +91-9876543210)
2. Click "Authorize WhatsApp"
3. A QR code will appear
4. Scan it with your WhatsApp phone
5. Wait for "Connected" status

**This is a one-time setup.**

### Step 2: Upload Buyer List

1. Prepare an Excel file with two sheets:
   - **Sheet 1: "Buyers"** - Your buyer list
   - **Sheet 2: "MessageTemplates"** - Message templates

2. Upload the file
3. System will show: "X buyers found, Y templates ready"

### Step 3: Start Campaign

1. Click "START CAMPAIGN"
2. Messages will be sent according to safety protocols
3. Monitor progress in the dashboard

---

## Excel File Format

### Sheet 1: "Buyers"

Required columns:

| Column | Example | Notes |
|--------|---------|-------|
| name | Amara Okafor | Buyer name |
| phone | 2348012345678 | International format, no + or spaces |
| country | Nigeria | Country name |
| product | Hybrid Seeds | Product name |
| price_usd | 45 | Unit price in USD |
| moq | 10 | Minimum order quantity |
| region_hook | Built for West African soil | Optional: region-specific message |

### Sheet 2: "MessageTemplates"

| Column | Example |
|--------|---------|
| template_id | 1 |
| content | Hi {{name}}, we have {{product}} available for {{country}}. MOQ is {{moq}} units at ${{price_usd}}/unit. Interested? |

**Available placeholders:**
- `{{name}}` - Buyer name
- `{{product}}` - Product name
- `{{country}}` - Country
- `{{price_usd}}` - Price
- `{{moq}}` - Minimum order quantity
- `{{phone}}` - Buyer phone number
- `{{region_hook}}` - Region-specific hook

---

## Safety Protocols (VERY CONSERVATIVE)

To avoid WhatsApp bans, these rules are enforced:

| Setting | Value |
|---------|-------|
| Delay between messages | 90-180 seconds (random) |
| Batch size | 10 messages |
| Break between batches | 4 hours |
| Max daily sends | 150 messages |
| Send hours | 10am-2pm only |
| Send days | Monday, Wednesday, Friday only |
| Max contacts per upload | 1000 |
| Auto-pause | Enabled (stops if issues detected) |

**Why these rules?**
- Random delays prevent detection as bot
- Batch breaks reduce spam flagging
- Limited hours/days looks human
- Conservative limits = WhatsApp won't ban your account

---

## File Structure

```
agro-campaign-app/
├── server.js                 (Express backend)
├── message-service.js        (Message template logic)
├── file-handler.js           (Excel processing)
├── package.json             (Dependencies)
├── .env.example             (Configuration template)
├── README.md                (This file)
└── public/
    ├── index.html           (User interface)
    ├── style.css            (Design - agricultural green theme)
    └── script.js            (Frontend logic)
```

---

## Monitoring

The dashboard shows:
- **Sent**: Number of messages successfully sent
- **Replies**: Number of buyer replies received
- **Failed**: Number of failed sends
- **Total**: Total buyers in campaign

---

## Troubleshooting

### "WhatsApp not connecting"
- Make sure WhatsApp is running on your phone
- Check internet connection
- Try scanning QR code again

### "No file uploaded"
- Ensure Excel file has two sheets: "Buyers" and "MessageTemplates"
- Check that required columns exist
- Max 1000 buyers per upload

### "Campaign paused"
- Auto-pause triggers if too many failures detected
- Check buyer phone numbers are valid
- Wait 1 hour and try again

### App won't start
- Check Node.js is installed: `node --version`
- Try: `npm install` again
- Make sure port 3000 is not in use

---

## Important Notes

⚠️ **Local Only**: Everything runs on your machine. No data sent anywhere.

⚠️ **Your Number**: Your WhatsApp number controls the sending. Be careful with it.

⚠️ **Consent**: Only send to people who agreed to receive messages.

⚠️ **WhatsApp ToS**: Follow WhatsApp's terms. Sending unsolicited bulk messages violates ToS.

---

## Next Steps (After Testing)

Once you've tested this web app locally and confirmed it works:

1. I'll convert this to a **.exe file** (Windows executable)
2. You can distribute the .exe to your client
3. Your client runs it without needing Node.js

---

## Support

For issues or questions, check:
- Browser console (F12) for errors
- Server logs in terminal
- Excel file format (see above)

---

**Version**: 1.0 (Beta)  
**Status**: Local testing ready
