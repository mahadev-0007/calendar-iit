# Calendar Priority Service - Next.js

A modern Next.js web application that processes your Futurense calendar and serves it as an ICS file with smart prioritization and a beautiful configuration interface.

## Features

- 🎨 **Modern React UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- 🔴 **Smart Zoom Prioritization**: Zoom meetings get configurable priority with custom reminders
- 🔵 **Flexible Event Settings**: Configure priority and reminders for all event types
- 📅 **Google Calendar Compatible**: Serves ICS format that works with any calendar app
- 🔄 **Real-time Processing**: Fetches fresh data from source on each request
- ⚡ **Fast Performance**: Built with Next.js App Router for optimal performance
- 📱 **Mobile Responsive**: Works perfectly on all device sizes

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Calendar Processing**: ical-generator, node-ical
- **API**: Next.js API Routes

## Setup

1. **Install dependencies:**
```bash
npm install
# or
yarn install
```

2. **Run the development server:**
```bash
npm run dev
# or
yarn dev
```

3. **Open your browser:**
Navigate to `http://localhost:3000`

## Usage

### Configure Your Calendar

1. Open the web interface at `http://localhost:3000`
2. Configure settings for Zoom events:
   - Priority level (1-5)
   - Enable/disable reminders
   - Set reminder timing (minutes before event)
3. Configure settings for other events:
   - Priority level (1-5)
   - Enable/disable reminders
   - Set reminder timing
4. Click "Generate Calendar URL"

### Subscribe in Google Calendar

1. Copy the generated URL from the interface
2. Open Google Calendar
3. Click "+" next to "Other calendars"
4. Select "From URL"
5. Paste the URL and click "Add calendar"

### API Endpoints

- `/` - Configuration interface
- `/api/calendar.ics` - ICS calendar file with query parameters
- `/api/health` - Health check endpoint

### URL Parameters

The calendar endpoint accepts these parameters:
- `zoom_priority` - Priority for Zoom events (1-5)
- `zoom_reminder` - Enable Zoom reminders (true/false)
- `zoom_reminder_minutes` - Minutes before Zoom events
- `other_priority` - Priority for other events (1-5)
- `other_reminder` - Enable other reminders (true/false)
- `other_reminder_minutes` - Minutes before other events

Example:
```
http://localhost:3000/api/calendar.ics?zoom_priority=1&zoom_reminder=true&zoom_reminder_minutes=15&other_priority=5&other_reminder=false&other_reminder_minutes=10
```

## Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Other Platforms
```bash
npm run build
npm start
```

The app can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Heroku**
- **Docker** containers

## Configuration

The source calendar URL is configured in `app/api/calendar.ics/route.ts`. Update the `ICS_URL` constant if needed.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```