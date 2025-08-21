import React, { useState, useEffect } from 'react';
import { type InstalledServer } from '../../shared/src/types';

interface ScheduledTask {
  id: string;
  serverName: string;
  type: 'backup' | 'restart';
  schedule: string;
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [servers, setServers] = useState<InstalledServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [taskType, setTaskType] = useState<'backup' | 'restart'>('backup');
  const [schedule, setSchedule] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const fetchTasks = async () => {
    const fetchedTasks = await window.electronAPI.listTasks();
    setTasks(fetchedTasks);
  };

  const fetchServers = async () => {
    const fetchedServers = await window.electronAPI.getInstalledServers();
    setServers(fetchedServers);
    if (fetchedServers.length > 0) {
      setSelectedServer(fetchedServers[0].name);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchServers();
  }, []);

  const handleCreateTask = async () => {
    if (!selectedServer || !schedule) {
      setStatus('Please select a server and enter a schedule.');
      return;
    }

    // Basic cron validation (more robust validation might be needed)
    const cronRegex = /^(\*|\d+|\d+-\d+)( \*|\d+|\d+-\d+){4}$/;
    if (!cronRegex.test(schedule)) {
        setStatus('Invalid cron schedule format. Example: * * * * *');
        return;
    }

    const result = await window.electronAPI.createTask({
      serverName: selectedServer,
      type: taskType,
      schedule: schedule,
    });

    if (result.success) {
      setStatus('Task created successfully!');
      setSchedule(''); // Clear form
      fetchTasks(); // Refresh list
    } else {
      setStatus(`Error creating task: ${result.message}`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const result = await window.electronAPI.deleteTask(taskId);
    if (result.success) {
      setStatus('Task deleted successfully!');
      fetchTasks(); // Refresh list
    } else {
      setStatus(`Error deleting task: ${result.message}`);
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Scheduled Tasks</h2>

      {status && <p className="mb-4 text-yellow-500">{status}</p>}

      <div className="mb-6 p-4 border border-gray-700 rounded-md">
        <h3 className="text-xl font-semibold mb-3">Schedule New Task</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="server-select" className="block text-sm font-medium text-gray-300 mb-1">
              Select Server:
            </label>
            <select
              id="server-select"
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
            >
              {servers.map((server) => (
                <option key={server.name} value={server.name}>
                  {server.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="task-type" className="block text-sm font-medium text-gray-300 mb-1">
              Task Type:
            </label>
            <select
              id="task-type"
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as 'backup' | 'restart')}
            >
              <option value="backup">Backup</option>
              <option value="restart">Restart</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="schedule-input" className="block text-sm font-medium text-gray-300 mb-1">
            Cron Schedule:
          </label>
          <input
            type="text"
            id="schedule-input"
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 0 3 * * * (daily at 3 AM)"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">
            Format: minute hour day_of_month month day_of_week (e.g., '0 3 * * *' for daily at 3 AM)
          </p>
        </div>
        <button
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
          onClick={handleCreateTask}
        >
          Schedule New Task
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-3">Current Scheduled Tasks</h3>
      {tasks.length === 0 ? (
        <p className="text-gray-400">No tasks scheduled yet.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
              <div>
                <p className="font-medium">{task.serverName}</p>
                <p className="text-sm text-gray-300">Type: {task.type}</p>
                <p className="text-sm text-gray-300">Schedule: {task.schedule}</p>
              </div>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md transition duration-300 ease-in-out"
                onClick={() => handleDeleteTask(task.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskManager;
