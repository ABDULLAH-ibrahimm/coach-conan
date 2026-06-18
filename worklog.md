---
Task ID: 1
Agent: Main
Task: Fix delete user, fix client login, fix image display, clean up database

Work Log:
- Changed delete endpoint from soft delete (status: inactive) to hard delete (completely removes client and all related data from database)
- Updated phone login to prioritize active+approved clients over inactive ones
- Updated email login to also prioritize active+approved clients
- Added inactive/not-approved check that blocks login for those clients with clear error message
- Cleaned up database: removed 8 test clients, kept only Abdullah
- Fixed Abdullah's phone number from "201021304688" to standard "01021304688" format
- Capitalized Abdullah's name
- Added profileImage to client list and pending clients API responses
- Updated i18n translations for delete confirmation messages (EN + AR)
- Added error handling in client portal for inactive/not-approved accounts
- Verified all fixes work via browser automation

Stage Summary:
- Delete now permanently removes client from system (not just soft delete)
- Phone login with 01021304688 now correctly returns Abdullah (not old test client)
- Profile images now show in client list cards and client portal
- Inactive/not-approved clients are blocked from logging in
- Database cleaned up to only contain Abdullah
