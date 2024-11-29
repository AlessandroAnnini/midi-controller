import { useReducer, useEffect, useCallback, useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks';

// ------------------- Type Definitions -------------------

/** Represents information about a connected MIDI device */
interface MIDIDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
  connection: 'open' | 'closed' | 'pending';
}

/** Configuration options for value transformation */
interface ValueTransformer {
  min?: number; // Minimum output value
  max?: number; // Maximum output value
  curve?: 'linear' | 'logarithmic' | 'exponential'; // Value scaling curve
  step?: number; // Value quantization step
  invert?: boolean; // Whether to invert the control
}

/** Action structure for the MIDI state reducer */
interface MIDIControllerAction {
  controller: string;
  value: number;
}

/** State structure for MIDI controller values */
interface MIDIControllerState {
  [key: string]: number;
}

/** Mapping structure for MIDI controllers */
interface MIDIControllersMap {
  [noteNumber: number]: {
    [command: number]: string;
  };
}

/** Configuration options for the useController hook */
interface UseControllerOptions {
  controllers: MIDIControllersMap;
  debounceTime?: number;
  valueTransformers?: {
    [controllerName: string]: ValueTransformer;
  };
}

/** Possible MIDI connection states */
export type MIDIConnectionStatus = 'disconnected' | 'connected' | 'error';

/** Return type for the useController hook */
interface UseControllerReturn {
  state: MIDIControllerState;
  status: MIDIConnectionStatus;
  connectedDevices: MIDIDeviceInfo[];
}

// ------------------- Helper Functions -------------------

/**
 * Apply curve transformation to a value
 */
const applyCurveTransformation = (
  value: number,
  curve: 'linear' | 'logarithmic' | 'exponential'
): number => {
  switch (curve) {
    case 'logarithmic':
      return Math.log(1 + value * 9) / Math.log(10);
    case 'exponential':
      return (Math.exp(value) - 1) / (Math.E - 1);
    default:
      return value;
  }
};

/**
 * Reducer function for managing MIDI controller state
 * Uses object spread for efficient updates
 */
const reducer = (
  state: MIDIControllerState,
  action: MIDIControllerAction
): MIDIControllerState => ({
  ...state,
  [action.controller]: action.value,
});

// Initial state for the MIDI controller
const initialState: MIDIControllerState = {};

// ------------------- Main Hook -------------------

/**
 * A React hook for handling MIDI controller input with value transformation
 * and device connection management.
 *
 * @param options - Configuration options for the controller
 * @returns Object containing current state, connection status, and connected devices
 */
export const useController = ({
  controllers,
  debounceTime = 0,
  valueTransformers = {},
}: UseControllerOptions): UseControllerReturn => {
  // State management
  const [state, dispatch] = useReducer(reducer, initialState);
  const [status, setStatus] = useState<MIDIConnectionStatus>('disconnected');
  const [connectedDevices, setConnectedDevices] = useState<MIDIDeviceInfo[]>(
    []
  );
  const [midiMessage, setMidiMessage] =
    useState<WebMidi.MIDIMessageEvent | null>(null);

  // Use useDebounce hook for debouncing MIDI messages
  const debouncedMessage = useDebounce(midiMessage, debounceTime);

  /**
   * Transforms raw MIDI values according to the specified transformation rules
   * Memoized to prevent unnecessary recalculations
   */
  const transformValue = useCallback(
    (controller: string, rawValue: number): number => {
      const transformer = valueTransformers[controller];
      if (!transformer) return rawValue;

      const { min = 0, max = 1, curve = 'linear', step, invert } = transformer;

      let value = invert ? 1 - rawValue : rawValue;

      // Apply curve transformation
      value = applyCurveTransformation(value, curve);

      // Apply range mapping
      value = min + (max - min) * value;

      // Quantize to steps if specified
      return step ? Math.round(value / step) * step : value;
    },
    [valueTransformers]
  );

  /**
   * Processes incoming MIDI messages
   * Now just updates the midiMessage state which will trigger the debounced effect
   */
  const onMIDIMessage = useCallback((message: WebMidi.MIDIMessageEvent) => {
    setMidiMessage(message);
  }, []);

  /**
   * Effect to process the debounced MIDI message
   */
  useEffect(() => {
    if (!debouncedMessage) return;

    try {
      const [command, note, velocity] = debouncedMessage.data;

      // Validate controller mapping exists
      const controllerMap = controllers[note]?.[command];
      if (!controllerMap) {
        console.warn(
          `No controller mapping found for note ${note} and command ${command}`
        );
        return;
      }

      // Calculate and transform value
      const rawValue = Math.round((velocity / 127) * 1000) / 1000;
      const transformedValue = transformValue(controllerMap, rawValue);

      dispatch({ controller: controllerMap, value: transformedValue });
    } catch (error) {
      console.error('Error processing MIDI message:', error);
      setStatus('error');
    }
  }, [debouncedMessage, controllers, transformValue]);

  /**
   * Updates the list of connected devices
   */
  const updateConnectedDevices = useCallback(
    (midiAccess: WebMidi.MIDIAccess) => {
      const devices = Array.from(midiAccess.inputs.values()).map((input) => ({
        id: input.id,
        name: input.name || 'Unknown Device',
        manufacturer: input.manufacturer || 'Unknown Manufacturer',
        connection: input.connection,
      }));
      setConnectedDevices(devices);
    },
    []
  );

  /**
   * Sets up MIDI access and handles device connections
   */
  useEffect(() => {
    let midiInputs: WebMidi.MIDIInput[] = [];

    // Request MIDI access
    window.navigator
      .requestMIDIAccess()
      .then((midiAccess) => {
        setStatus('connected');
        updateConnectedDevices(midiAccess);

        // Handle MIDI device state changes
        midiAccess.onstatechange = (event) => {
          const newStatus =
            event.port.state === 'connected' ? 'connected' : 'disconnected';
          setStatus(newStatus);
          updateConnectedDevices(midiAccess);

          console.log(
            `MIDI port ${event.port.name} ${event.port.state}:`,
            event.port.manufacturer
          );
        };

        // Set up message handlers for all inputs
        midiInputs = Array.from(midiAccess.inputs.values());
        midiInputs.forEach((input) => {
          input.onmidimessage = onMIDIMessage;
        });
      })
      .catch(() => {
        console.log('Could not access your MIDI devices.');
        setStatus('error');
      });

    // Cleanup function
    return () => {
      midiInputs.forEach((input) => {
        input.onmidimessage = null;
      });
    };
  }, [controllers, onMIDIMessage, updateConnectedDevices]);

  return { state, status, connectedDevices };
};
