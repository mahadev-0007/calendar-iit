from flask import Flask, Response, render_template_string, request, redirect, url_for
from icalendar import Calendar, Event, Alarm
from datetime import datetime, timedelta
import pytz
import requests
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# URL for the ICS file
ICS_URL = "https://iitjbsc.futurense.com/calendar/export_execute.php?userid=2020&authtoken=2aa807c9922b9597879495f195f01552cf16a011&preset_what=all&preset_time=recentupcoming"

# Default configuration
DEFAULT_CONFIG = {
    'zoom_priority': 1,
    'zoom_reminder': True,
    'zoom_reminder_minutes': 15,
    'other_priority': 5,
    'other_reminder': False,
    'other_reminder_minutes': 10
}

def process_calendar(config=None):
    """Fetch and process the calendar from the source URL"""
    if config is None:
        config = DEFAULT_CONFIG
    try:
        # Fetch the calendar from URL
        logger.info("📥 Fetching calendar from URL...")
        response = requests.get(ICS_URL, timeout=30)
        response.raise_for_status()
        
        # Load the calendar from the response content
        cal = Calendar.from_ical(response.content)
        
        # Create a new calendar
        new_cal = Calendar()
        new_cal.add("prodid", "-//Filtered High Priority Calendar//futurense//")
        new_cal.add("version", "2.0")
        
        local_tz = pytz.timezone("Asia/Kolkata")
        zoom_events_count = 0
        other_events_count = 0
        
        for component in cal.walk():
            if component.name == "VEVENT":
                event = Event()
                
                # Copy main fields
                event.add("summary", component.get("SUMMARY"))
                event.add("description", component.get("DESCRIPTION"))
                event.add("categories", component.get("CATEGORIES"))
                
                start = component.get("DTSTART").dt
                end = component.get("DTEND").dt
                event.add("dtstart", start)
                event.add("dtend", end)
                
                # Copy other important fields if they exist
                if component.get("LOCATION"):
                    event.add("location", component.get("LOCATION"))
                if component.get("UID"):
                    event.add("uid", component.get("UID"))
                if component.get("CREATED"):
                    event.add("created", component.get("CREATED"))
                if component.get("LAST-MODIFIED"):
                    event.add("last-modified", component.get("LAST-MODIFIED"))
                
                description = component.get("DESCRIPTION")
                
                # Check if this is a Zoom event (high priority)
                if description and "https://futurense.zoom.us/" in description:
                    # Set Zoom event priority
                    event.add("priority", config['zoom_priority'])
                    
                    # Add reminder if enabled
                    if config['zoom_reminder']:
                        alarm = Alarm()
                        alarm.add("action", "DISPLAY")
                        alarm.add("description", "Reminder: Zoom meeting starting soon")
                        alarm.add("trigger", timedelta(minutes=-config['zoom_reminder_minutes']))
                        event.add_component(alarm)
                    
                    zoom_events_count += 1
                else:
                    # Set other events priority
                    event.add("priority", config['other_priority'])
                    
                    # Add reminder if enabled
                    if config['other_reminder']:
                        alarm = Alarm()
                        alarm.add("action", "DISPLAY")
                        alarm.add("description", "Reminder: Event starting soon")
                        alarm.add("trigger", timedelta(minutes=-config['other_reminder_minutes']))
                        event.add_component(alarm)
                    
                    other_events_count += 1
                
                new_cal.add_component(event)
        
        logger.info(f"📊 Processed {zoom_events_count} Zoom events and {other_events_count} other events")
        return new_cal.to_ical()
        
    except Exception as e:
        logger.error(f"Error processing calendar: {str(e)}")
        raise

@app.route('/calendar.ics')
def get_calendar():
    """Serve the processed ICS calendar file with URL parameters"""
    try:
        # Get configuration from URL parameters
        config = {
            'zoom_priority': int(request.args.get('zoom_priority', DEFAULT_CONFIG['zoom_priority'])),
            'zoom_reminder': request.args.get('zoom_reminder', 'true').lower() == 'true',
            'zoom_reminder_minutes': int(request.args.get('zoom_reminder_minutes', DEFAULT_CONFIG['zoom_reminder_minutes'])),
            'other_priority': int(request.args.get('other_priority', DEFAULT_CONFIG['other_priority'])),
            'other_reminder': request.args.get('other_reminder', 'false').lower() == 'true',
            'other_reminder_minutes': int(request.args.get('other_reminder_minutes', DEFAULT_CONFIG['other_reminder_minutes']))
        }
        
        ics_data = process_calendar(config)
        
        return Response(
            ics_data,
            mimetype='text/calendar',
            headers={
                'Content-Disposition': 'attachment; filename=high_priority_events.ics',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        )
    except Exception as e:
        logger.error(f"Error serving calendar: {str(e)}")
        return f"Error processing calendar: {str(e)}", 500

CONFIG_FORM_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>📅 Calendar Configuration</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .form-group { margin: 15px 0; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        .checkbox-group { display: flex; align-items: center; gap: 10px; }
        .checkbox-group input[type="checkbox"] { margin: 0; }
        .section { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .section h3 { margin-top: 0; color: #333; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #0056b3; }
        .url-display { background: #e9ecef; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .url-display code { background: #fff; padding: 5px; border-radius: 3px; }
        .priority-info { font-size: 0.9em; color: #666; margin-top: 5px; }
    </style>
</head>
<body>
    <h1>📅 High Priority Calendar Service</h1>
    <p>Configure your calendar processing settings below. The generated URL can be used to subscribe in Google Calendar.</p>
    
    <form method="POST" action="/configure">
        <div class="section">
            <h3>🔴 Zoom Events Settings</h3>
            <div class="form-group">
                <label for="zoom_priority">Priority Level:</label>
                <select name="zoom_priority" id="zoom_priority">
                    <option value="1" {{ 'selected' if config.zoom_priority == 1 else '' }}>1 - Highest</option>
                    <option value="2" {{ 'selected' if config.zoom_priority == 2 else '' }}>2 - High</option>
                    <option value="3" {{ 'selected' if config.zoom_priority == 3 else '' }}>3 - Medium</option>
                    <option value="4" {{ 'selected' if config.zoom_priority == 4 else '' }}>4 - Low</option>
                    <option value="5" {{ 'selected' if config.zoom_priority == 5 else '' }}>5 - Normal</option>
                </select>
                <div class="priority-info">Lower numbers = higher priority in most calendar apps</div>
            </div>
            <div class="form-group">
                <div class="checkbox-group">
                    <input type="checkbox" name="zoom_reminder" id="zoom_reminder" {{ 'checked' if config.zoom_reminder else '' }}>
                    <label for="zoom_reminder">Enable Reminders</label>
                </div>
            </div>
            <div class="form-group">
                <label for="zoom_reminder_minutes">Reminder Time (minutes before):</label>
                <input type="number" name="zoom_reminder_minutes" id="zoom_reminder_minutes" value="{{ config.zoom_reminder_minutes }}" min="1" max="1440">
            </div>
        </div>
        
        <div class="section">
            <h3>🔵 Other Events Settings</h3>
            <div class="form-group">
                <label for="other_priority">Priority Level:</label>
                <select name="other_priority" id="other_priority">
                    <option value="1" {{ 'selected' if config.other_priority == 1 else '' }}>1 - Highest</option>
                    <option value="2" {{ 'selected' if config.other_priority == 2 else '' }}>2 - High</option>
                    <option value="3" {{ 'selected' if config.other_priority == 3 else '' }}>3 - Medium</option>
                    <option value="4" {{ 'selected' if config.other_priority == 4 else '' }}>4 - Low</option>
                    <option value="5" {{ 'selected' if config.other_priority == 5 else '' }}>5 - Normal</option>
                </select>
            </div>
            <div class="form-group">
                <div class="checkbox-group">
                    <input type="checkbox" name="other_reminder" id="other_reminder" {{ 'checked' if config.other_reminder else '' }}>
                    <label for="other_reminder">Enable Reminders</label>
                </div>
            </div>
            <div class="form-group">
                <label for="other_reminder_minutes">Reminder Time (minutes before):</label>
                <input type="number" name="other_reminder_minutes" id="other_reminder_minutes" value="{{ config.other_reminder_minutes }}" min="1" max="1440">
            </div>
        </div>
        
        <button type="submit" class="btn">Generate Calendar URL</button>
    </form>
    
    {% if calendar_url %}
    <div class="url-display">
        <h3>📋 Your Calendar URL:</h3>
        <code>{{ calendar_url }}</code>
        <p><strong>How to use:</strong></p>
        <ol>
            <li>Copy the URL above</li>
            <li>Open Google Calendar</li>
            <li>Click "+" next to "Other calendars"</li>
            <li>Select "From URL"</li>
            <li>Paste the URL and click "Add calendar"</li>
        </ol>
        <p><a href="{{ calendar_url }}" target="_blank">🔗 Test Calendar Link</a></p>
    </div>
    {% endif %}
</body>
</html>
"""

@app.route('/')
def index():
    """Configuration form page"""
    return render_template_string(CONFIG_FORM_TEMPLATE, config=DEFAULT_CONFIG, calendar_url=None)

@app.route('/configure', methods=['POST'])
def configure():
    """Process configuration form and generate calendar URL"""
    config = {
        'zoom_priority': int(request.form.get('zoom_priority', DEFAULT_CONFIG['zoom_priority'])),
        'zoom_reminder': 'zoom_reminder' in request.form,
        'zoom_reminder_minutes': int(request.form.get('zoom_reminder_minutes', DEFAULT_CONFIG['zoom_reminder_minutes'])),
        'other_priority': int(request.form.get('other_priority', DEFAULT_CONFIG['other_priority'])),
        'other_reminder': 'other_reminder' in request.form,
        'other_reminder_minutes': int(request.form.get('other_reminder_minutes', DEFAULT_CONFIG['other_reminder_minutes']))
    }
    
    # Generate calendar URL with parameters
    base_url = request.url_root.rstrip('/')
    params = []
    params.append(f"zoom_priority={config['zoom_priority']}")
    params.append(f"zoom_reminder={'true' if config['zoom_reminder'] else 'false'}")
    params.append(f"zoom_reminder_minutes={config['zoom_reminder_minutes']}")
    params.append(f"other_priority={config['other_priority']}")
    params.append(f"other_reminder={'true' if config['other_reminder'] else 'false'}")
    params.append(f"other_reminder_minutes={config['other_reminder_minutes']}")
    
    calendar_url = f"{base_url}/calendar.ics?{'&'.join(params)}"
    
    return render_template_string(CONFIG_FORM_TEMPLATE, config=config, calendar_url=calendar_url)

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)