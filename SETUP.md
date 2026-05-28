# Setup & Testing Guide

Complete steps to test the Ganesh Agro Campaign Manager locally.

---

## Prerequisites

Make sure you have:
- Node.js installed (`node --version`)
- npm installed (`npm --version`)
- An active WhatsApp account on your phone

---

## Step 1: Install Dependencies (5 minutes)

```bash
cd /Users/architgoyal/agro-campaign-app
npm install
```

Wait for installation to complete. You should see:
```
added 200+ packages
```

---

## Step 2: Create Excel Template (2 minutes)

Generate a sample Excel file with buyers and message templates:

```bash
node create-template.js
```

You should see:
```
✅ Excel template created: agro_buyer_template.xlsx
📋 Sheet 1: "Buyers" with 3 sample buyers
💬 Sheet 2: "MessageTemplates" with 5 message templates
```

The file `agro_buyer_template.xlsx` is now ready to upload.

---

## Step 3: Start the Server (2 minutes)

```bash
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
```

**Keep this terminal open while testing.**

---

## Step 4: Open Browser (1 minute)

Open your browser and go to:
```
http://localhost:3000
```

You should see the **Ganesh Agro Campaign Manager** interface with:
- Header: "Ganesh Agro - WhatsApp Campaign Manager"
- 3 main sections: Authorization, Upload, Campaign

---

## Step 5: Test WhatsApp Authorization (2-3 minutes)

### In the app:
1. Enter your WhatsApp number: `+91-9876543210` (replace with yours)
2. Click **"Authorize WhatsApp"**
3. A QR code will appear on screen

### On your phone:
1. Open **WhatsApp**
2. Go to **Settings** → **Linked Devices**
3. Click **"Link a device"**
4. Scan the QR code shown in the browser

### Back in app:
- Wait 10-30 seconds
- You should see: **"✅ WhatsApp Connected Successfully!"**
- Button changes to "Connected"

---

## Step 6: Test File Upload (1 minute)

### In the app:
1. Click **"Upload Excel"** button
2. Select the `agro_buyer_template.xlsx` file you created earlier
3. You should see:
   - ✅ File uploaded
   - 3 buyers
   - 5 message templates

---

## Step 7: Test Campaign Start (Optional - Real Test)

⚠️ **WARNING**: This will actually send WhatsApp messages!

Only do this if you want to test real sending:

1. Click **"START CAMPAIGN"**
2. The dashboard will show live progress:
   - Sent: 1/3
   - Replies: 0
   - Messages sent every 90-180 seconds
   - Batch breaks after 10 messages

**What's happening:**
- 10 messages sent (to sample buyers)
- 4-hour break
- Then next batch (if more than 10)

Since the template has only 3 buyers, you'll see:
- Sent: 3/3 within ~3 minutes
- Campaign complete

---

## Step 8: Verify It Works

### Check Server Logs:
In the terminal where you ran `npm start`, you should see:
```
📝 Message for Amara Okafor (Nigeria):
──────────────────────────────────────────────────
Hi Amara, we have Hybrid Maize Seeds available for Nigeria...
──────────────────────────────────────────────────
✅ Sent to Amara Okafor
```

### Check Your WhatsApp:
You should receive actual WhatsApp messages from yourself:
```
Hi Amara, we have Hybrid Maize Seeds available for Nigeria. 
MOQ is 10 units at $45/unit. Interested?
```

---

## Troubleshooting

### "Server not running"
```bash
# Make sure you're in the right directory
cd /Users/architgoyal/agro-campaign-app

# Start again
npm start
```

### "WhatsApp not connecting"
- Check your phone has internet
- Try scanning QR code again
- Close and reopen WhatsApp
- If still failing, unlink device and try again

### "Can't upload file"
- Check Excel has two sheets: "Buyers" and "MessageTemplates"
- File should be .xlsx format (not .xls)
- Max 1000 buyers per file

### "Messages not sending"
- Check WhatsApp is still connected (status should show "Connected")
- Check phone numbers are valid international format
- Server logs will show errors

### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Try starting again
npm start
```

---

## Next Steps After Testing

Once you've confirmed everything works:

1. **Prepare real buyer data**
   - Get buyer list with phone numbers
   - Prepare your message templates

2. **Upload real file**
   - Create Excel with your buyers
   - Upload and test with 5-10 buyers first
   - Gradually increase volume

3. **Convert to .EXE**
   - Once satisfied with testing
   - I'll package this as Windows .exe
   - Client won't need Node.js

---

## Important Reminders

✅ **Everything runs locally** - No data sent to cloud

✅ **Your WhatsApp number** - Controls who messages come from

✅ **WhatsApp ToS** - Follow guidelines, don't spam

✅ **Consent required** - Only message people who agreed

✅ **Conservative limits** - Built in to avoid bans

---

## Testing Checklist

- [ ] Node.js installed
- [ ] npm install completed
- [ ] Excel template generated
- [ ] Server started (npm start)
- [ ] Browser opened to http://localhost:3000
- [ ] WhatsApp authorized (QR code scanned)
- [ ] File uploaded successfully
- [ ] (Optional) Campaign started and messages sent
- [ ] No errors in browser console (F12)
- [ ] WhatsApp messages received on phone

---

## Questions?

Check the README.md for:
- How to format Excel files
- Safety protocols explained
- File structure overview

---

**Status**: Ready for local testing ✅
