'use client';

import { useState } from 'react';
import { CalendarConfig } from '../page';

interface ConfigFormProps {
  config: CalendarConfig;
  onSubmit: (config: CalendarConfig) => void;
}

export default function ConfigForm({ config, onSubmit }: ConfigFormProps) {
  const [formData, setFormData] = useState<CalendarConfig>(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof CalendarConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const priorityOptions = [
    { value: 1, label: '1 - Highest' },
    { value: 2, label: '2 - High' },
    { value: 3, label: '3 - Medium' },
    { value: 4, label: '4 - Low' },
    { value: 5, label: '5 - Normal' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Zoom Events Section */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <h3 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
          🔴 Zoom Events Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <select
              value={formData.zoomPriority}
              onChange={(e) => handleInputChange('zoomPriority', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Lower numbers = higher priority</p>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={formData.zoomReminder}
                onChange={(e) => handleInputChange('zoomReminder', e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span>Enable Reminders</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Time (minutes before)
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              value={formData.zoomReminderMinutes}
              onChange={(e) => handleInputChange('zoomReminderMinutes', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              disabled={!formData.zoomReminder}
            />
          </div>
        </div>
      </div>

      {/* Other Events Section */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
          🔵 Other Events Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <select
              value={formData.otherPriority}
              onChange={(e) => handleInputChange('otherPriority', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={formData.otherReminder}
                onChange={(e) => handleInputChange('otherReminder', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Enable Reminders</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Time (minutes before)
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              value={formData.otherReminderMinutes}
              onChange={(e) => handleInputChange('otherReminderMinutes', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!formData.otherReminder}
            />
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate Calendar URL
        </button>
      </div>
    </form>
  );
}