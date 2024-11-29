import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useController } from '../hooks/useMidiController';

// MIDI controller mapping
const u33e = {
  13: {
    176: 'C26',
    177: 'C27',
    178: 'C28',
    179: 'C29',
    180: 'C30',
    181: 'C31',
    182: 'C31',
    183: 'C33',
  },
  12: {
    176: 'C18',
    177: 'C19',
    178: 'C20',
    179: 'C21',
    180: 'C22',
    181: 'C23',
    182: 'C24',
    183: 'C25',
  },
  10: {
    176: 'C10',
    177: 'C11',
    178: 'C12',
    179: 'C13',
    180: 'C14',
    181: 'C15',
    182: 'C16',
    183: 'C17',
  },
  7: {
    176: 'F1',
    177: 'F2',
    178: 'F3',
    179: 'F4',
    180: 'F5',
    181: 'F6',
    182: 'F7',
    183: 'F8',
  },
  28: {
    176: 'F9',
  },
};

interface ControlProps {
  value: number;
  label: string;
}

const KnobControl: React.FC<ControlProps> = ({ value = 0, label }) => {
  const rotation = value * 270; // Convert 0-1 to 0-270 degrees

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-700 relative"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.1s ease-out',
        }}>
        <div className="absolute top-0 left-1/2 w-1 h-2 bg-blue-400 -translate-x-1/2" />
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
};

const FaderControl: React.FC<ControlProps> = ({ value = 0, label }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-12 h-36 bg-gray-800 rounded-lg relative">
      <div
        className="absolute bottom-0 left-0 right-0 bg-gray-600 rounded-lg"
        style={{
          height: `${value * 100}%`,
          transition: 'height 0.1s ease-out',
        }}>
        <div className="w-full h-4 bg-gray-700 rounded-sm absolute -top-2 cursor-pointer hover:bg-gray-600" />
      </div>
    </div>
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
      <span className="text-xs">{label}</span>
    </div>
  </div>
);

interface DisplayProps {
  value: number;
}

const Display: React.FC<DisplayProps> = ({ value }) => (
  <div className="w-24 h-12 bg-blue-900 rounded flex items-center justify-center">
    <span className="text-blue-400 font-mono text-2xl">{value.toFixed(2)}</span>
  </div>
);

const UC33eController: React.FC = () => {
  const { state, status, connectedDevices } = useController({
    controllers: u33e,
    debounceTime: 16, // ~60fps
  });

  const isConnected = status === 'connected';

  return (
    <Card className="w-full max-w-4xl bg-gray-900 p-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
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
          </div>
          <Display value={state.F9 || 0} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Top row of knobs */}
          <div className="grid grid-cols-8 gap-4">
            {['C26', 'C27', 'C28', 'C29', 'C30', 'C31', 'C32', 'C33'].map(
              (id) => (
                <KnobControl key={id} value={state[id] || 0} label={id} />
              )
            )}
          </div>

          {/* Middle row of knobs */}
          <div className="grid grid-cols-8 gap-4">
            {['C18', 'C19', 'C20', 'C21', 'C22', 'C23', 'C24', 'C25'].map(
              (id) => (
                <KnobControl key={id} value={state[id] || 0} label={id} />
              )
            )}
          </div>

          {/* Bottom row of knobs */}
          <div className="grid grid-cols-8 gap-4">
            {['C10', 'C11', 'C12', 'C13', 'C14', 'C15', 'C16', 'C17'].map(
              (id) => (
                <KnobControl key={id} value={state[id] || 0} label={id} />
              )
            )}
          </div>

          {/* Faders */}
          <div className="grid grid-cols-9 gap-4">
            {['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'].map(
              (id) => (
                <FaderControl key={id} value={state[id] || 0} label={id} />
              )
            )}
          </div>
        </div>

        {/* Connected devices */}
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

export default UC33eController;
