/**
 * Google Sheets Integration Helper
 *
 * Sends form data to Google Sheets via Apps Script Web App.
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://sheets.google.com and create a NEW spreadsheet named "Coach Conan - Data"
 * 2. Create the following sheets (tabs) in the spreadsheet:
 *    - "Contact Submissions"
 *    - "Client Registrations"
 *    - "Client Progress"
 * 3. Go to Extensions > Apps Script
 * 4. Replace the code with the script from GOOGLE_SHEETS_SETUP.md
 * 5. Click Deploy > New Deployment
 * 6. Select type: Web app
 * 7. Set "Execute as": Me
 * 8. Set "Who has access": Anyone
 * 9. Click Deploy and copy the Web App URL
 * 10. Add the URL to your .env file as GOOGLE_SHEETS_WEBAPP_URL
 */

const GOOGLE_SHEETS_WEBAPP_URL = process.env.GOOGLE_SHEETS_WEBAPP_URL || ''

interface SheetRow {
  sheet: string
  data: Record<string, unknown>
}

export async function sendToGoogleSheets(sheet: string, data: Record<string, unknown>): Promise<boolean> {
  if (!GOOGLE_SHEETS_WEBAPP_URL) {
    console.log(`[Google Sheets] Not configured. Would send to sheet "${sheet}":`, data)
    return false
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheet, data } satisfies SheetRow),
    })

    if (!response.ok) {
      console.error('[Google Sheets] Failed:', await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('[Google Sheets] Error:', error)
    return false
  }
}

export function isGoogleSheetsConfigured(): boolean {
  return !!GOOGLE_SHEETS_WEBAPP_URL
}
