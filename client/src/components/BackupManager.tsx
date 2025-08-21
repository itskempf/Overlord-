import React, { useState, useEffect, useCallback } from 'react';
import type { InstalledServer } from 'shared';
import toast from 'react-hot-toast';
import { confirmToast } from './ConfirmToast';

interface BackupManagerProps {
  server: InstalledServer;
}

const BackupManager: React.FC<BackupManagerProps> = ({ server }) => {
  const [backups, setBackups] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('Idle');

  const fetchBackups = useCallback(async () => {
    const fetchedBackups = await window.electronAPI.listBackups(server.name);
    setBackups(fetchedBackups);
  }, [server.name]);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleCreateBackup = async () => {
    setStatus('Backing up...');
    const promise = window.electronAPI.createBackup(server);
    toast.promise(promise, {
      loading: 'Creating backup...',
      success: 'Backup created successfully!',
      error: (err) => `Error creating backup: ${err.message}`,
    });
    await promise; // Wait for the promise to resolve/reject before setting status back to Idle
    setStatus('Idle');
  };

  const handleRestoreBackup = async (backupFileName: string) => {
    const ok = await confirmToast(`Restore ${backupFileName}? This will overwrite your current server files.`);
    if (!ok) { toast('Restore cancelled.'); return; }
    setStatus('Restoring...');
    const promise = window.electronAPI
      .restoreBackup(server, backupFileName)
      .then((result) => {
        if (!result.success) throw new Error(`Error restoring backup: ${result.message}`);
        return result;
      });
    toast.promise(promise, {
      loading: 'Restoring backup...',
      success: 'Backup restored successfully!',
      error: (err) => err.message,
    });
    try {
      await promise;
    } finally {
      setStatus('Idle');
    }
  };
  const isDisabled = status !== 'Idle';

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md text-white">
      <h2 className="text-xl font-semibold mb-4">Backup Manager</h2>
  <p className="mb-4 flex items-center gap-2">Status: {status} {status !== 'Idle' && (<span className="inline-block h-4 w-4 border-2 border-b-transparent rounded-full animate-spin" />)}</p>

      <button
        onClick={handleCreateBackup}
        disabled={isDisabled}
        className={`px-4 py-2 rounded-md ${isDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-4`}
      >
        Create New Backup
      </button>

      <h3 className="text-lg font-semibold mb-2">Existing Backups</h3>
      {backups.length === 0 ? (
        <p className="text-gray-400">No backups found.</p>
      ) : (
        <ul className="space-y-2">
          {backups.map((backup) => (
            <li key={backup} className="flex justify-between items-center bg-gray-700 p-2 rounded-md">
              <span>{backup}</span>
              <button
                onClick={() => handleRestoreBackup(backup)}
                disabled={isDisabled}
                className={`px-3 py-1 rounded-md ${isDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'} text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50`}
              >
                Restore
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BackupManager;