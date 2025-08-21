import React, { useState, useEffect } from 'react';
import { InstalledServer } from 'shared';

// Define the ScheduledTask interface
interface ScheduledTask {
  id: string;
  serverId: string;
  serverName: string;
  taskType: 'Backup' | 'Restart';
  schedule: string;
}

const TaskManager: React.FC = () => {
  // 1. STATE:
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>('');
  const [taskType, setTaskType] = useState<'Backup' | 'Restart'>('Backup');
  const [scheduleString, setScheduleString] = useState<string>('');
  const [installedServers, setInstalledServers] = useState<InstalledServer[]>([]);

  // 2. INITIAL LOAD (useEffect):
  useEffect(() => {
    const fetchTasksAndServers = async () => {
      // Fetch scheduled tasks
      const tasks = await window.electronAPI.listTasks();
      setScheduledTasks(tasks);

      // Fetch installed servers
      const servers = await window.electronAPI.steamcmdGetInstalledServers();
      setInstalledServers(servers);
      if (servers.length > 0) {
        setSelectedServerId(servers[0].appId); // Select the first server by default
      }
    };
    fetchTasksAndServers();
  }, []);

  // 3. FUNCTIONS:
  const handleCreateTask = async () => {
    if (!selectedServerId || !scheduleString) {
      alert('Please select a server and provide a schedule.');
      return;
    }

    const server = installedServers.find(s => s.appId === selectedServerId);
    if (!server) {
      alert('Selected server not found.');
      return;
    }

    const newTask: Omit<ScheduledTask, 'id'> = {
      serverId: selectedServerId,
      serverName: server.name,
      taskType,
      schedule: scheduleString,
    };

    await window.electronAPI.createTask(newTask);
    // Refresh the task list after creation
    const updatedTasks = await window.electronAPI.listTasks();
    setScheduledTasks(updatedTasks);

    // Clear form
    setScheduleString('');
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await window.electronAPI.deleteTask(id);
      // Refresh the task list after deletion
      const updatedTasks = await window.electronAPI.listTasks();
      setScheduledTasks(updatedTasks);
    }
  };

  // 4. RENDER LOGIC:
  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md text-white">
      <h2 className="text-xl font-semibold mb-4">Scheduled Tasks</h2>

      {/* Task Creation Form */}
      <div className="mb-6 p-4 border border-gray-700 rounded-md">
        <h3 className="text-lg font-medium mb-3">Schedule New Task</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="server-select" className="block text-sm font-medium text-gray-300 mb-1">Select Server:</label>
            <select
              id="server-select"
              className="w-full p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedServerId}
              onChange={(e) => setSelectedServerId(e.target.value)}
            >
              {installedServers.map((server) => (
                <option key={server.appId} value={server.appId}>
                  {server.name} ({server.appId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="task-type" className="block text-sm font-medium text-gray-300 mb-1">Task Type:</label>
            <select
              id="task-type"
              className="w-full p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as 'Backup' | 'Restart')}
            >
              <option value="Backup">Backup</option>
              <option value="Restart">Restart</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="schedule-string" className="block text-sm font-medium text-gray-300 mb-1">Cron Schedule (e.g., '0 3 * * *'):</label>
          <input
            type="text"
            id="schedule-string"
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 0 3 * * * (daily at 3 AM)"
            value={scheduleString}
            onChange={(e) => setScheduleString(e.target.value)}
          />
        </div>
        <button
          onClick={handleCreateTask}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Schedule New Task
        </button>
      </div>

      {/* List of Scheduled Tasks */}
      <h3 className="text-lg font-medium mb-3">Current Scheduled Tasks</h3>
      {scheduledTasks.length === 0 ? (
        <p className="text-gray-400">No tasks scheduled yet.</p>
      ) : (
        <ul className="space-y-3">
          {scheduledTasks.map((task) => (
            <li key={task.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
              <div>
                <p className="font-medium">{task.serverName} - {task.taskType}</p>
                <p className="text-sm text-gray-400">Schedule: {task.schedule}</p>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
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
