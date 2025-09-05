'use client';

import { useState } from 'react';
import ConfigForm from './components/ConfigForm';
import CalendarUrlDisplay from './components/CalendarUrlDisplay';

export interface CalendarConfig {
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

export default function Home() {
  const [config, setConfig] = useState<CalendarConfig>(defaultConfig);
  const [calendarUrl, setCalendarUrl] = useState<string>('');

  const handleConfigSubmit = (newConfig: CalendarConfig) => {
    setConfig(newConfig);
    
    // Generate calendar URL with parameters
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({
      zoom_priority: newConfig.zoomPriority.toString(),
      zoom_reminder: newConfig.zoomReminder.toString(),
      zoom_reminder_minutes: newConfig.zoomReminderMinutes.toString(),
      other_priority: newConfig.otherPriority.toString(),
      other_reminder: newConfig.otherReminder.toString(),
      other_reminder_minutes: newConfig.otherReminderMinutes.toString(),
    });
    
    const url = `${baseUrl}/api/calendar.ics?${params.toString()}`;
    setCalendarUrl(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📅 Calendar Priority Service
            </h1>
            <p className="text-gray-600">
              Configure your calendar processing settings. The generated URL can be used to subscribe in Google Calendar.
            </p>
          </div>

          <ConfigForm
            config={config}
            onSubmit={handleConfigSubmit}
          />

          {calendarUrl && (
            <CalendarUrlDisplay url={calendarUrl} />
          )}
        </div>
      </div>
    </div>
  );
}