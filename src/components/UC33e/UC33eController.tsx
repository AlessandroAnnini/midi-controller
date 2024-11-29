import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Display } from '@/components/UC33e/Display';
import { KnobControl } from '@/components/UC33e/KnobControl';
import { FaderControl } from '@/components/UC33e/FaderControl';

interface UC33eControllerProps {
  state: Record<string, number>;
  status: string;
  connectedDevices: { id: string; name: string; manufacturer: string }[];
}

const UC33eController = ({
  state,
  status,
  connectedDevices,
}: UC33eControllerProps) => {
  const isConnected = status === 'connected';
  const [previousState, setPreviousState] = useState<Record<string, number>>(
    {}
  );
  const [lastChangedId, setLastChangedId] = useState<string>('');

  useEffect(() => {
    if (isConnected) {
      // Find the last changed value
      const changedId = Object.keys(state).find(
        (key) => state[key] !== previousState[key]
      );
      if (changedId) {
        setLastChangedId(changedId);
      }
      setPreviousState(state);
    }
  }, [isConnected, state]);

  return (
    <Card className="w-full max-w-5xl bg-gray-900 p-6">
      {/* Top section with title and display */}
      <div className="flex justify-between items-start mb-8">
        <CardHeader className="p-0">
          <CardTitle className="text-xl text-gray-200">
            Evolution U-Control UC-33e
          </CardTitle>
          <p className="text-sm text-gray-400">
            Status:{' '}
            {isConnected ? (
              <span className="text-green-400">Connected</span>
            ) : (
              <span className="text-red-400">Disconnected</span>
            )}
          </p>
        </CardHeader>
        <Display value={state[lastChangedId] || 0} />
      </div>

      <CardContent className="p-0">
        {/* Controls section */}
        <div className="flex gap-12">
          {/* Main controls */}
          <div className="flex-1 space-y-8">
            {/* Knob rows */}
            <div className="grid grid-cols-8 gap-4">
              {['C26', 'C27', 'C28', 'C29', 'C30', 'C31', 'C32', 'C33'].map(
                (id) => (
                  <KnobControl
                    key={id}
                    value={state[id] || 0}
                    label={id}
                    isActive={id === lastChangedId}
                  />
                )
              )}
            </div>

            <div className="grid grid-cols-8 gap-4">
              {['C18', 'C19', 'C20', 'C21', 'C22', 'C23', 'C24', 'C25'].map(
                (id) => (
                  <KnobControl
                    key={id}
                    value={state[id] || 0}
                    label={id}
                    isActive={id === lastChangedId}
                  />
                )
              )}
            </div>

            <div className="grid grid-cols-8 gap-4">
              {['C10', 'C11', 'C12', 'C13', 'C14', 'C15', 'C16', 'C17'].map(
                (id) => (
                  <KnobControl
                    key={id}
                    value={state[id] || 0}
                    label={id}
                    isActive={id === lastChangedId}
                  />
                )
              )}
            </div>

            {/* Faders F1-F8 */}
            <div className="grid grid-cols-8 gap-4">
              {['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8'].map((id) => (
                <FaderControl
                  key={id}
                  value={state[id] || 0}
                  label={id}
                  isActive={id === lastChangedId}
                />
              ))}
            </div>
          </div>

          {/* F9 slider aligned with other faders */}
          <div className="flex items-end">
            <FaderControl
              value={state.F9 || 0}
              label="F9"
              isActive={lastChangedId === 'F9'}
            />
          </div>
        </div>

        {/* Connected devices in its own container */}
        <div className="mt-6 border-t border-gray-800 pt-4">
          <h3 className="text-sm font-medium text-gray-400">
            Connected Devices:
          </h3>
          <ul className="mt-2 space-y-1">
            {connectedDevices.map((device) => (
              <li key={device.id} className="text-sm text-gray-500">
                {device.name} ({device.manufacturer})
              </li>
            ))}
            {connectedDevices.length === 0 && (
              <li className="text-sm text-gray-500">No devices connected</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export { UC33eController };
