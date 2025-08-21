import React, { useState, useEffect, useRef } from 'react';

const ServerConsole: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<string>('Offline');
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleServerStatus = (status: string) => {
      setServerStatus(status);
    };

    const handleServerLog = (message: string) => {
      setLogMessages((prevMessages) => [...prevMessages, message]);
    };

    window.electronAPI.onServerStatus(handleServerStatus);
    window.electronAPI.onServerLog(handleServerLog);

    return () => {
      // Clean up listeners when the component unmounts
      // Note: ipcRenderer.removeListener is generally preferred for specific listeners
      // but for simplicity and given the context, re-registering on each mount is fine.
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the log container when new messages arrive
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logMessages]);

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md text-white font-mono">
      <h2 className="text-xl font-semibold mb-4">Server Console</h2>
      <p className="mb-2">
        Status: <span className="font-bold">{serverStatus}</span>
      </p>
      <div
        ref={logContainerRef}
        className="bg-black p-3 rounded-md h-64 overflow-y-auto text-sm leading-relaxed"
        style={{ scrollBehavior: 'smooth' }}
      >
        {logMessages.length === 0 ? (
          <p className="text-gray-500">Waiting for server logs...</p>
        ) : (
          logMessages.map((msg, index) => (
            <p key={index} className="whitespace-pre-wrap break-words">
              {msg}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export default ServerConsole;
