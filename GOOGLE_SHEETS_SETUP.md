# Google Sheets Integration Setup Guide

This guide shows you how to connect your Coach Conan website to Google Sheets for physical storage of all form data.

## What Data Gets Stored

| Sheet Tab | Data | Source |
|-----------|------|--------|
| Contact Submissions | Name, Email, Phone, Service, Message, Timestamp | Contact form on website |
| Client Registrations | Name, Email, Phone, Age, Gender, Weight, Height, Goal, Approval Status, Timestamp | Client portal registration |
| Client Progress | Client Name, Weight, Body Fat, Muscle Mass, Measurements, Notes, Timestamp | Client progress entries |

## Step-by-Step Setup

### Step 1: Create the Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Blank** to create a new spreadsheet
3. Name it **"Coach Conan - Data"**
4. Create 3 sheets (tabs) by clicking the **+** button at the bottom:
   - Rename "Sheet1" to **"Contact Submissions"**
   - Add a new sheet named **"Client Registrations"**
   - Add a new sheet named **"Client Progress"**

### Step 2: Add Headers to Each Sheet

**Contact Submissions** - Add these headers in Row 1:
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Name | Email | Phone | Service | Message | Timestamp |

**Client Registrations** - Add these headers in Row 1:
| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Name | Email | Phone | Age | Gender | Weight | Height | Goal | Approval Status | Registered At |

**Client Progress** - Add these headers in Row 1:
| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Client Name | Weight (kg) | Body Fat (%) | Muscle Mass (kg) | Waist (cm) | Chest (cm) | Arms (cm) | Thighs (cm) | Hips (cm) | Notes | Timestamp |

### Step 3: Add the Apps Script

1. In your spreadsheet, go to **Extensions** > **Apps Script**
2. Delete any existing code
3. Paste the following code:

```javascript
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheetName = payload.sheet || 'Contact Submissions';
    var data = payload.data || {};
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    // If sheet doesn't exist, create it
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    // Get headers from row 1
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // If no headers yet, use object keys
    if (!headers || headers[0] === '') {
      headers = Object.keys(data);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // Build row data matching headers
    var rowData = headers.map(function(header) {
      var value = data[header];
      if (value === undefined || value === null) return '';
      return String(value);
    });
    
    // Append the row
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      sheet: sheetName 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Coach Conan Data API is running ✓');
}
```

4. Click **Save** (floppy disk icon)
5. Click **Deploy** > **New Deployment**
6. Click the gear icon next to "Select type" and choose **Web app**
7. Set the following:
   - **Description**: "Coach Conan Data API"
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone**
8. Click **Deploy**
9. You may be asked to authorize the script:
   - Click **Authorize Access**
   - Select your Google account
   - Click **Advanced** > **Go to Coach Conan Data API (unsafe)**
   - Click **Allow**
10. **Copy the Web App URL** (it looks like `https://script.google.com/macros/s/xxxxx/exec`)

### Step 4: Add the URL to Your Environment

1. Open your project's `.env` file (create it if it doesn't exist in the project root)
2. Add this line:
```
GOOGLE_SHEETS_WEBAPP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```
3. Replace the URL with the one you copied in Step 3
4. Restart your development server

### Step 5: Test the Integration

1. Go to your website's contact form
2. Submit a test message
3. Check your Google Sheet - a new row should appear in "Contact Submissions"
4. Try the client portal registration
5. Check "Client Registrations" tab

## Important Notes

- **Data is stored in BOTH the local database AND Google Sheets** - Google Sheets serves as a backup/physical storage
- If the Google Sheets integration fails, data is still saved locally - nothing is lost
- The Apps Script runs on Google's servers and is free for reasonable usage
- Each form submission makes an HTTP request to Google Sheets (non-blocking)
- **Keep your Web App URL secret** - anyone with the URL can write to your sheets

## Troubleshooting

**Data not appearing in sheets?**
- Check that the Web App URL is correct in your .env file
- Make sure the Apps Script is deployed as "Anyone" access
- Check the Apps Script executions log: Extensions > Apps Script > Executions

**Getting authorization errors?**
- Redeploy the script and re-authorize
- Make sure you selected "Execute as: Me"

**Wrong columns?**
- Make sure your sheet headers in Row 1 match the data field names exactly
- The script auto-matches data keys to header names
