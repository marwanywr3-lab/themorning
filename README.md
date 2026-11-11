# themorning

A mobile-first, bilingual morning command center. Vanilla JavaScript, independent CSS, Tailwind CDN, Lucide CDN, Google Identity Services, and Open-Meteo. No build step, application server, database, analytics, or shared user sessions.

## Run locally

Serve this directory over HTTP, for example with `npx serve .` (Node.js) or `python -m http.server 8080` (Python). Open the localhost URL. Opening index.html directly as a file does not support service workers or OAuth.

## Deploy to GitHub Pages

1. Copy the contents of this directory into the root of your GitHub repository (or its docs folder).
2. Add the shared Google configuration described below to the first two lines of app.js.
3. Commit and push. In repository Settings → Pages, select Deploy from a branch, choose the branch and root (or docs), then save.
4. Visit `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`. Relative manifest, icon, script, and service-worker URLs support repository subpaths without editing.
5. Add that origin in Google Cloud. Always use HTTPS in production.

This delivery contains source files for your requested GitHub Pages deployment; it has not been uploaded to a repository or published.

## Google Cloud: one configuration for all visitors

1. Create a Google Cloud project. Enable Google Calendar API and Google Tasks API.
2. Configure Google Auth Platform branding, audience, and data access. Add exactly these scopes:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/tasks`
3. While the app is in Testing, add test users. For general public availability, publish the consent screen and complete any verification Google requires. Provide your actual public privacy policy and application homepage.
4. Create an OAuth 2.0 client of type **Web application**. Add Authorized JavaScript origins: `https://YOUR_USERNAME.github.io` and your local test origin, including its port. Origins contain no repository path. The popup token flow does not require a redirect URI.
5. Create an API key. Restrict it to Calendar and Tasks APIs, and restrict website referrers to your deployed URL pattern and development URL. Public API keys and OAuth client IDs are intentionally visible; never put a client secret in this project.
6. Set the two constants at the very top of app.js:

   ```js
   const GOOGLE_CLIENT_ID = "your-shared-id.apps.googleusercontent.com";
   const GOOGLE_API_KEY = "your-shared-key";
   ```

Visitors do not supply developer keys. The app requests Google authorization only after the user presses the explicit authorization button on the transparency dialog. Partial permission grants are rejected. Google errors and blocked/closed popups leave the dialog available for retry.

Reference: https://developers.google.com/identity/oauth2/web/guides/use-token-model

## Privacy, sessions, and behavior

- The requested short-lived access token and expiration time are stored exclusively in this origin's localStorage. There is no refresh token or silent refresh; reconnect after expiry. Tokens are checked before each request and every second while open. A 401 clears the session.
- Storage is isolated by browser profile and origin, not by a physical device user. Other people using that same profile can access its session. Use a separate browser profile on shared devices. Scripts running on the origin, including dependencies, can access localStorage. Keep dependencies trusted; use a dedicated origin for stronger separation from unrelated apps.
- Sign out clears the token, dismissed task IDs, and in-memory Google data, and requests token revocation when Google's library is available. This does not sign out of Google globally. You can also revoke the app in your Google account.
- Calendar and task contents remain in memory only. They are never persisted or cached by the service worker. Theme, language, dismissed task identifiers, weather snapshot, and the requested token are the only persisted application values. Google calls go directly from the visitor's browser to Google with bearer authorization.
- The account pill represents the Google authorization session. No profile/email scope is requested; it uses a generic account avatar rather than downloading personal profile information.
- Agenda reads the **primary calendar**, including recurring instances and all-day events, using local-day start and next-day start as an exclusive upper bound. Times use the device timezone. Hijri dates use the browser's calculated Umm al-Qura calendar and may differ from local moon-sighting announcements.
- Tasks read every page of every task list, including completed/hidden tasks. Due dates are compared by their date portion: Google Tasks due dates are date-only values. Tasks without due dates do not appear. New tasks go to the selected Google list.
- All overdue unfinished tasks are shown, including items older than yesterday. Dismiss hides the item locally without changing Google. Restore dismissed items undoes this. Reschedule preserves the task and moves its due date to today. Task updates roll back on failure; offline writes are disabled and are never silently queued.
- Data refreshes on connection, manually, every five minutes, and at local midnight while the app is open. This is not a background alarm or notification service.
- Geolocation uses the browser permission prompt with Riyadh fallback. Coordinates are sent to Open-Meteo to obtain weather and are not persisted. A weather snapshot is stored locally for offline display. UV is the day's maximum UV index. The mini forecast shows the next three hourly readings. Weather times are rendered in the device timezone.
- Open-Meteo data attribution: https://open-meteo.com/ — check its current usage terms before commercial deployment.

## Offline and installation

The service worker precaches the local app shell and PNG icons after a successful online load. Navigation uses network first with a shell fallback; static assets use cache first. Cross-origin requests, including Google endpoints, are never intercepted or cached. Increment the `CACHE` version in sw.js when releasing changed shell assets. Updates activate once older controlled tabs are closed; reopen to use the new version.

Core layout uses local style.css and remains readable without the Tailwind CDN. Offline first visits are not supported. CDN fonts and Lucide icons may fall back to system fonts and text-only controls offline; weather uses Unicode symbols. Google data requires a connection and an active token. The latest weather snapshot remains available with a saved-weather label when a network request fails.

On supported Android Chrome/Samsung browsers, use the install button when offered or the browser's Add to Home screen menu. On iOS, use Share → Add to Home Screen. Installability and prompts depend on the browser and HTTPS. Both 192px and 512px PNG icons are provided, with a maskable-safe large icon.

## Verification

JavaScript syntax and manifest parsing were checked locally. A contract test checks DOM references, translation coverage, date filtering, and service-worker cache boundaries. Browser previews could not connect to the local server in this environment. Real OAuth/API calls require configured credentials and have not been tested here.

Before public release, verify at 360–430px widths (including Galaxy A55), both languages and themes, denied location, all-day/recurring events, no-data states, task completion and rollback, adding tasks, overdue reschedule/dismiss/restore, expired tokens, two browser profiles, installation, and an offline reload after initial installation. Test Google consent with a permitted test account first.
