from icalendar import Calendar, Event, Alarm
from datetime import datetime, timedelta
import pytz
import requests

# URL for the ICS file
ics_url = "https://iitjbsc.futurense.com/calendar/export_execute.php?userid=2020&authtoken=2aa807c9922b9597879495f195f01552cf16a011&preset_what=all&preset_time=recentupcoming"

# Fetch the calendar from URL
print("📥 Fetching calendar from URL...")
response = requests.get(ics_url)
response.raise_for_status()  # Raise an exception for bad status codes

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
            # Mark as high priority
            event.add("priority", 1)
            
            # Add a reminder/alarm 15 minutes before
            alarm = Alarm()
            alarm.add("action", "DISPLAY")
            alarm.add("description", "Reminder: Zoom meeting starting soon")
            alarm.add("trigger", timedelta(minutes=-15))  # 15 minutes before
            event.add_component(alarm)
            
            zoom_events_count += 1
        else:
            # Normal priority for other events
            event.add("priority", 5)
            other_events_count += 1
        
        new_cal.add_component(event)

# Save the new calendar
with open("high_priority_events.ics", "wb") as f:
    f.write(new_cal.to_ical())

print(f"✅ New calendar saved as high_priority_events.ics")
print(f"📊 Summary:")
print(f"   🔴 High priority Zoom events: {zoom_events_count}")
print(f"   🔵 Other events: {other_events_count}")
print(f"   📅 Total events: {zoom_events_count + other_events_count}")
