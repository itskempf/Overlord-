import React, { useState, useEffect, useRef } from 'react';

const ServerConsole: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<string>('Offline');
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.electronAPI.onServerStatus((status: string) => {
      setServerStatus(status);
    });

    window.electronAPI.onServerLog((log: string) => {
      setLogMessages((prevLogs) => [...prevLogs, log]);
    });

    // Scroll to the bottom of the console when new logs arrive
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logMessages]);

  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-md text-white font-mono">
      <h2 className="text-xl font-semibold mb-4">Server Console</h2>
      <p className="mb-2">
        Status: <span className="font-medium text-green-400">{serverStatus}</span>
      </p>
      <div className="bg-black p-3 rounded-md h-64 overflow-y-scroll text-sm leading-relaxed">
        {logMessages.map((msg, index) => (
          <p key={index} className="whitespace-pre-wrap">{msg}</p>
        ))}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};

export default ServerConsole;
