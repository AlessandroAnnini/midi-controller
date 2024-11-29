import { useReducer, useEffect, useCallback, useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks';

// Type definitions remain the same
interface MIDIDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
  connection: 'open' | 'closed' | 'pending';
}

interface ValueTransformer {
  min?: number;
  max?: number;
  curve?: 'linear' | 'logarithmic' | 'exponential';
  step?: number;
  invert?: boolean;
}

interface MIDIControllerAction {
  controller: string;
  value: number;
}

interface MIDIControllerState {
  [key: string]: number;
}

interface MIDIControllersMap {
  [noteNumber: number]: {
    [command: number]: string;
  };
}

interface UseControllerOptions {
  controllers: MIDIControllersMap;
  debounceTime?: number;
  valueTransformers?: {
    [controllerName: string]: ValueTransformer;
  };
}

export type MIDIConnectionStatus = 'disconnected' | 'connected' | 'error';

interface UseControllerReturn {
  state: MIDIControllerState;
  status: MIDIConnectionStatus;
  connectedDevices: MIDIDeviceInfo[];
}

// Simplified curve transformation
const applyCurve = (
  value: number,
  curve: 'linear' | 'logarithmic' | 'exponential'
): number => {
  if (curve === 'logarithmic') return Math.log(1 + value * 9) / Math.log(10);
  if (curve === 'exponential') return (Math.exp(value) - 1) / (Math.E - 1);
  return value;
};

// Simple reducer
const reducer = (
  state: MIDIControllerState,
  action: MIDIControllerAction
): MIDIControllerState => ({
  ...state,
  [action.controller]: action.value,
});

export const useController = ({
  controllers,
  debounceTime = 0,
  valueTransformers = {},
}: UseControllerOptions): UseControllerReturn => {
  const [state, dispatch] = useReducer(reducer, {});
  const [status, setStatus] = useState<MIDIConnectionStatus>('disconnected');
  const [connectedDevices, setConnectedDevices] = useState<MIDIDeviceInfo[]>(
    []
  );
  const [midiMessage, setMidiMessage] =
    useState<WebMidi.MIDIMessageEvent | null>(null);
  const debouncedMessage = useDebounce(midiMessage, debounceTime);

  // Memoized transform function
  const transformValue = useCallback(
    (controller: string, rawValue: number): number => {
      const transformer = valueTransformers[controller];
      if (!transformer) return rawValue;

      const { min = 0, max = 1, curve = 'linear', step, invert } = transformer;
      let value = invert ? 1 - rawValue : rawValue;
      value = applyCurve(value, curve);
      value = min + (max - min) * value;
      return step ? Math.round(value / step) * step : value;
    },
    [JSON.stringify(valueTransformers)]
  ); // Use JSON.stringify for deep comparison

  // MIDI message handler
  const onMIDIMessage = useCallback((message: WebMidi.MIDIMessageEvent) => {
    setMidiMessage(message);
  }, []);

  // Process debounced MIDI messages
  useEffect(() => {
    if (!debouncedMessage) return;

    const [command, note, velocity] = debouncedMessage.data;
    const controllerMap = controllers[note]?.[command];

    if (controllerMap) {
      const rawValue = Math.round((velocity / 127) * 1000) / 1000;
      const transformedValue = transformValue(controllerMap, rawValue);
      dispatch({ controller: controllerMap, value: transformedValue });
    }
  }, [debouncedMessage, JSON.stringify(controllers), transformValue]);

  // Handle device connections
  const updateDevices = useCallback((midiAccess: WebMidi.MIDIAccess) => {
    const devices = Array.from(midiAccess.inputs.values()).map((input) => ({
      id: input.id,
      name: input.name || 'Unknown Device',
      manufacturer: input.manufacturer || 'Unknown Manufacturer',
      connection: input.connection,
    }));
    setConnectedDevices(devices);
  }, []);

  // Initialize MIDI
  useEffect(() => {
    let midiInputs: WebMidi.MIDIInput[] = [];

    navigator
      .requestMIDIAccess()
      .then((midiAccess) => {
        setStatus('connected');
        updateDevices(midiAccess);

        midiAccess.onstatechange = (event) => {
          setStatus(
            event.port.state === 'connected' ? 'connected' : 'disconnected'
          );
          updateDevices(midiAccess);
        };

        midiInputs = Array.from(midiAccess.inputs.values());
        midiInputs.forEach((input) => {
          input.onmidimessage = onMIDIMessage;
        });
      })
      .catch(() => {
        console.log('MIDI access denied');
        setStatus('error');
      });

    return () => {
      midiInputs.forEach((input) => {
        input.onmidimessage = null;
      });
    };
  }, [onMIDIMessage, updateDevices]);

  return { state, status, connectedDevices };
};
