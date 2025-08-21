import toast from 'react-hot-toast';

type Options = { confirmText?: string; cancelText?: string };

export function confirmToast(message: string, options: Options = {}): Promise<boolean> {
  const { confirmText = 'Confirm', cancelText = 'Cancel' } = options;
  return new Promise<boolean>((resolve) => {
    const id = toast.custom((t) => (
      <div className={`max-w-sm w-full bg-gray-800 text-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 p-4 ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
        <div className="flex items-start">
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
            <div className="mt-3 flex gap-2">
              <button
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                onClick={() => { toast.dismiss(id); resolve(true); }}
              >
                {confirmText}
              </button>
              <button
                className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white text-sm"
                onClick={() => { toast.dismiss(id); resolve(false); }}
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 10000, id: `confirm-${Date.now()}` });
  });
}

export default confirmToast;
