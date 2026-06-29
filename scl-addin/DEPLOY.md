# SCL Revenue Tracker — Full Deploy Guide
# Email → Outlook button → Claude → Excel updates automatically

Total time: ~30 minutes, one-time.
After this: SJ or Jen clicks one button, approves a suggestion, Excel updates itself.

---

## What you need before starting
- GitHub account (free)
- Vercel account (free) — vercel.com
- Access to Microsoft 365 Admin Center (admin.microsoft.com)
- The SCL Excel file already on SharePoint/OneDrive ✓
- An Anthropic API key — platform.anthropic.com → API keys

---

## PART 1 — Deploy the web app to Vercel (10 min)

### 1. Create a GitHub repo
- Go to github.com → New repository → name it "scl-tracker" → Create
- Upload the entire scl-addin/ folder (drag and drop in the GitHub UI)
  Make sure the structure looks like:
    scl-addin/
      src/
        taskpane.html
        taskpane.js
        commands.html
      manifest.xml
      DEPLOY.md

### 2. Add icon images
  In the src/ folder, add three square PNG files:
    icon-16.png   (16×16 px)
    icon-32.png   (32×32 px)  
    icon-80.png   (80×80 px)
  Use the SCL logo or any square image. Resize at squareresizer.com if needed.

### 3. Deploy on Vercel
- Go to vercel.com → Add New Project → Import from GitHub → select scl-tracker
- When asked for settings:
    Framework Preset: Other
    Root Directory:   scl-addin
    Output Directory: src
- Click Deploy
- Copy the URL it gives you, e.g.: https://scl-tracker-abc123.vercel.app

### 4. Update manifest.xml
  Open manifest.xml and replace ALL 5 instances of:
    YOUR-DEPLOY-URL
  with your Vercel URL (no trailing slash), e.g.:
    https://scl-tracker-abc123.vercel.app

  The 5 places are: IconUrl, HighResolutionIconUrl, SupportUrl,
  Commands.Url, Taskpane.Url, and the three Icon image URLs.

  Commit and push — Vercel redeploys automatically in ~30 seconds.

---

## PART 2 — Power Automate flow (10 min)
# This makes Apply → write directly to Excel. Skip if you want log-only for now.

### 1. Create the flow
- Go to make.powerautomate.com
- New flow → Instant cloud flow → "When an HTTP request is received"
- Copy the HTTP POST URL it generates — you'll paste this into the add-in settings

### 2. Add these steps after the trigger:

  STEP: Parse JSON
    Content: triggerOutputs()['body']
    Schema: paste this:
    {
      "type": "object",
      "properties": {
        "engagement_id": {"type": "string"},
        "field":         {"type": "string"},
        "value":         {},
        "old_value":     {},
        "client":        {"type": "string"},
        "engagement":    {"type": "string"},
        "confidence":    {"type": "string"},
        "edited_by_user":{"type": "boolean"},
        "applied_at":    {"type": "string"}
      }
    }

  STEP: Condition
    engagement_id is not empty  AND  field is not empty

  IF YES branch:

    STEP: List rows present in a table  (Excel Online - Business)
      Location:    SharePoint site where the file lives
      Document Library: Documents (or wherever)
      File:        2026_Revenue_Tracker_CLEANED.xlsx
      Table:       tblRevenue

    STEP: Filter array
      From: output of List rows
      Keep rows where: EngagementID equals  engagement_id  (from Parse JSON)

    STEP: Condition
      Length of filtered array is greater than 0

    IF YES:
      STEP: Update a row  (Excel Online - Business)
        Same file/table as above
        Key Column:  EngagementID
        Key Value:   engagement_id
        
        Now map the field dynamically. Add this expression in the column field:
          If field = 'Status' → set Status column to value
          Otherwise → set the month column (field) to value
        
        The cleanest way: add TWO Update a row steps side by side in a
        parallel branch, each inside a Condition:
          Branch A: field equals 'Status'  → Update a row, set Status = value
          Branch B: field not equals 'Status' → Update a row, set [field] = value
          (For Branch B, in the column picker choose the dynamic column using
           the expression: items('Apply_to_each')[body('Parse_JSON')?['field']])

    STEP: Add a row into a table  (Excel Online - Business)
      File: same file
      Table: tblChangeLog  ← create this table in a new sheet called "ChangeLog"
             Columns: Date, Time, EngagementID, Client, Engagement,
                      Field, OldValue, NewValue, Confidence, EditedByUser
      Values: map from Parse JSON fields + applied_at split into date/time

### 3. Save and copy the webhook URL
  The HTTP trigger step shows the URL after you save.
  It looks like: https://prod-18.westus.logic.azure.com:443/workflows/abc.../triggers/...

---

## PART 3 — Install the add-in (5 min)

### 1. Upload to Microsoft 365 Admin Center
- Go to admin.microsoft.com
- Settings → Integrated apps → Upload custom apps
- Choose "Office Add-in" → Upload manifest file → select manifest.xml
- Assign to: SJ and Jen (by email address, or a group)
- Click Deploy

### 2. Wait ~5 minutes
  The add-in appears in their Outlook ribbon as "Tracker" under "SCL Tracker".
  Works in: Outlook on the web, Outlook desktop (Windows/Mac), Outlook mobile.

---

## PART 4 — First-time setup per user (2 min each)

SJ or Jen:
1. Opens any email
2. Clicks "Tracker" in the ribbon
3. Clicks ⚙ API key
4. Pastes the Anthropic API key in the first field
5. Pastes the Power Automate webhook URL in the second field
6. Done — both are saved locally, never entered again

---

## How it works day-to-day

SJ gets an email: "Aquiline has paid the Giovanni Nonni invoice — $6,000"
1. She clicks Tracker in the ribbon
2. Clicks ▶ Analyze this email
3. Panel shows: "ENG-018 Aquiline / Giovanni Nonni — set Status: Paid, Jun: $6,000"
4. She clicks ✓ Apply
5. Power Automate fires, Excel updates in seconds
6. Change is logged in the ChangeLog tab with timestamp and her confidence rating

If Claude isn't sure (two possible matches), she clicks Edit, picks the right row, applies.
If the email isn't relevant, Claude says so and nothing happens.

---

## Maintenance

Roster update (when engagements change significantly):
- Run build.py + inject step → push to GitHub → Vercel redeploys in 30 sec
- Frequency: quarterly, or whenever there's a big batch of new clients

Everything else: zero maintenance.
Outlook add-in framework: maintained by Microsoft.
Claude API: maintained by Anthropic.
Vercel hosting: free tier, no action needed.

---

## Cost estimate
Claude API: ~$0.01–0.02 per email analyzed
At 10 emails/day: ~$4–6/month
Power Automate: included in Microsoft 365 Business ✓
Vercel: free tier (plenty of capacity) ✓
