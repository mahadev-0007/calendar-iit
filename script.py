from icalendar import Calendar
from datetime import datetime
import pytz

# Load the ICS file
with open("icalexport.ics", "rb") as f:
    cal = Calendar.from_ical(f.read())

# Timezone (change if needed)
local_tz = pytz.timezone("Asia/Kolkata")

for component in cal.walk():
    if component.name == "VEVENT":
        description = component.get("DESCRIPTION")
        if description and "https://futurense.zoom.us/" in description:
            summary = component.get("SUMMARY")
            start = component.get("DTSTART").dt
            end = component.get("DTEND").dt
            category = component.get("CATEGORIES")

            # Convert UTC to local timezone if datetime
            if isinstance(start, datetime):
                start = start.astimezone(local_tz)
            if isinstance(end, datetime):
                end = end.astimezone(local_tz)

            print("====================================")
            print(f"Title      : {summary}")
            print(f"Category   : {category}")
            print(f"Start Time : {start}")
            print(f"End Time   : {end}")
            print(f"Description:\n{description}")
            print("====================================\n")
