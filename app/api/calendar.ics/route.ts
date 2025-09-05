import { NextRequest, NextResponse } from 'next/server';
import ical from 'ical-generator';

const ICS_URL = "https://iitjbsc.futurense.com/calendar/export_execute.php?userid=2020&authtoken=2aa807c9922b9597879495f195f01552cf16a011&preset_what=all&preset_time=recentupcoming";

interface CalendarConfig {
  zoomPriority: number;
  zoomReminder: boolean;
  zoomReminderMinutes: number;
  otherPriority: number;
  otherReminder: boolean;
  otherReminderMinutes: number;
}

const defaultConfig: CalendarConfig = {
  zoomPriority: 1,
  zoomReminder: true,
  zoomReminderMinutes: 15,
  otherPriority: 5,
  otherReminder: false,
  otherReminderMinutes: 10,
};

async function processCalendar(config: CalendarConfig) {
  try {
    console.log('📥 Fetching calendar from URL...');
    const response = await fetch(ICS_URL, {
      headers: {
        'User-Agent': 'Calendar-Priority-Service/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const icsData = await response.text();
    
    // Parse the original calendar using a simple parser
    const events = parseICSData(icsData);
    
    // Create new calendar
    const calendar = ical({
      name: 'High Priority Calendar',
      description: 'Processed calendar with smart prioritization',
      timezone: 'Asia/Kolkata',
      prodId: {
        company: 'futurense',
        product: 'calendar-priority-service',
        language: 'EN'
      },
    });

    let zoomEventsCount = 0;
    let otherEventsCount = 0;

    events.forEach((event) => {
      const isZoomEvent = event.description && event.description.includes('https://futurense.zoom.us/');
      
      const calendarEvent = calendar.createEvent({
        start: event.start,
        end: event.end,
        summary: event.summary,
        description: event.description,
        location: event.location,
        uid: event.uid || `${Date.now()}-${Math.random()}`,
      });

      if (isZoomEvent) {
        calendarEvent.priority(config.zoomPriority);
        
        if (config.zoomReminder) {
          calendarEvent.createAlarm({
            type: 'display' as any,
            trigger: config.zoomReminderMinutes * 60, // seconds before
            description: 'Reminder: Zoom meeting starting soon',
          });
        }
        
        zoomEventsCount++;
      } else {
        calendarEvent.priority(config.otherPriority);
        
        if (config.otherReminder) {
          calendarEvent.createAlarm({
            type: 'display' as any,
            trigger: config.otherReminderMinutes * 60, // seconds before
            description: 'Reminder: Event starting soon',
          });
        }
        
        otherEventsCount++;
      }
    });

    console.log(`📊 Processed ${zoomEventsCount} Zoom events and ${otherEventsCount} other events`);
    return calendar.toString();
    
  } catch (error) {
    console.error('Error processing calendar:', error);
    throw error;
  }
}

function parseICSData(icsData: string) {
  const events = [];
  const lines = icsData.split('\n');
  let currentEvent: any = null;
  let currentProperty = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Handle line continuations
    while (i + 1 < lines.length && lines[i + 1].startsWith(' ')) {
      i++;
      line += lines[i].trim();
    }
    
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT' && currentEvent) {
      events.push(currentEvent);
      currentEvent = null;
    } else if (currentEvent && line.includes(':')) {
      const colonIndex = line.indexOf(':');
      const property = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 1);
      
      switch (property.split(';')[0]) {
        case 'SUMMARY':
          currentEvent.summary = value;
          break;
        case 'DESCRIPTION':
          currentEvent.description = value.replace(/\\n/g, '\n').replace(/\\,/g, ',');
          break;
        case 'LOCATION':
          currentEvent.location = value;
          break;
        case 'DTSTART':
          currentEvent.start = parseICSDate(value);
          break;
        case 'DTEND':
          currentEvent.end = parseICSDate(value);
          break;
        case 'UID':
          currentEvent.uid = value;
          break;
      }
    }
  }
  
  return events;
}

function parseICSDate(dateString: string): Date {
  // Handle different date formats
  if (dateString.includes('T')) {
    // DateTime format: 20231201T143000Z or 20231201T143000
    const cleanDate = dateString.replace(/[TZ]/g, '');
    const year = parseInt(cleanDate.substring(0, 4));
    const month = parseInt(cleanDate.substring(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(cleanDate.substring(6, 8));
    const hour = parseInt(cleanDate.substring(8, 10)) || 0;
    const minute = parseInt(cleanDate.substring(10, 12)) || 0;
    const second = parseInt(cleanDate.substring(12, 14)) || 0;
    
    return new Date(year, month, day, hour, minute, second);
  } else {
    // Date only format: 20231201
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1;
    const day = parseInt(dateString.substring(6, 8));
    
    return new Date(year, month, day);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const config: CalendarConfig = {
      zoomPriority: parseInt(searchParams.get('zoom_priority') || defaultConfig.zoomPriority.toString()),
      zoomReminder: searchParams.get('zoom_reminder') === 'true',
      zoomReminderMinutes: parseInt(searchParams.get('zoom_reminder_minutes') || defaultConfig.zoomReminderMinutes.toString()),
      otherPriority: parseInt(searchParams.get('other_priority') || defaultConfig.otherPriority.toString()),
      otherReminder: searchParams.get('other_reminder') === 'true',
      otherReminderMinutes: parseInt(searchParams.get('other_reminder_minutes') || defaultConfig.otherReminderMinutes.toString()),
    };

    const icsData = await processCalendar(config);

    return new NextResponse(icsData, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename=high_priority_events.ics',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error serving calendar:', error);
    return new NextResponse(`Error processing calendar: ${error}`, {
      status: 500,
    });
  }
}