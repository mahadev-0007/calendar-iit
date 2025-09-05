'use client';

import { useState } from 'react';

interface CalendarUrlDisplayProps {
  url: string;
}

export default function CalendarUrlDisplay({ url }: CalendarUrlDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
        📋 Your Calendar URL
      </h3>
      
      <div className="bg-white p-4 rounded-md border border-green-300 mb-4">
        <code className="text-sm text-gray-800 break-all">{url}</code>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          {copied ? '✅ Copied!' : '📋 Copy URL'}
        </button>
        
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md font-medium hover:bg-blue-200 transition-colors duration-200 text-center"
        >
          🔗 Test Calendar Link
        </a>
      </div>

      <div className="bg-white p-4 rounded-md border border-green-300">
        <h4 className="font-semibold text-green-800 mb-2">How to use in Google Calendar:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Copy the URL above</li>
          <li>Open Google Calendar</li>
          <li>Click "+" next to "Other calendars"</li>
          <li>Select "From URL"</li>
          <li>Paste the URL and click "Add calendar"</li>
        </ol>
        
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>💡 Tip:</strong> Google Calendar will automatically refresh this subscription 
            periodically to get updates from your source calendar.
          </p>
        </div>
      </div>
    </div>
  );
}