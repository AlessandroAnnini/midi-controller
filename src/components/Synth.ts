import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';

interface SynthProps {
  state: Record<string, number>;
}

const Synth: React.FC<SynthProps> = ({ state }) => {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const distortionRef = useRef<Tone.Distortion | null>(null);
  const delayRef = useRef<Tone.FeedbackDelay | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const lfoRef = useRef<Tone.LFO | null>(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth();
    filterRef.current = new Tone.Filter();
    distortionRef.current = new Tone.Distortion();
    delayRef.current = new Tone.FeedbackDelay();
    reverbRef.current = new Tone.Reverb();
    lfoRef.current = new Tone.LFO();

    synthRef.current.connect(filterRef.current);
    filterRef.current.connect(distortionRef.current);
    distortionRef.current.connect(delayRef.current);
    delayRef.current.connect(reverbRef.current);
    reverbRef.current.toDestination();

    return () => {
      synthRef.current?.dispose();
      filterRef.current?.dispose();
      distortionRef.current?.dispose();
      delayRef.current?.dispose();
      reverbRef.current?.dispose();
      lfoRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!synthRef.current) return;

    // Synth parameters
    synthRef.current.set({
      volume: typeof state.C26 === 'number' ? state.C26 * 24 - 12 : 0,
      detune: typeof state.C27 === 'number' ? state.C27 * 100 - 50 : 0,
    });

    // Filter parameters
    if (filterRef.current) {
      const freq =
        typeof state.C29 === 'number' ? 20 + state.C29 * 19980 : 1000;
      filterRef.current.frequency.value = freq;
      filterRef.current.Q.value =
        typeof state.C30 === 'number' ? state.C30 * 10 : 1;
      filterRef.current.gain.value =
        typeof state.C31 === 'number' ? state.C31 * 24 - 12 : 0;
    }

    // LFO parameters
    if (lfoRef.current) {
      lfoRef.current.frequency.value =
        typeof state.C32 === 'number' ? state.C32 * 20 : 1;
      lfoRef.current.amplitude.value =
        typeof state.C33 === 'number' ? state.C33 : 0;
    }

    // Effects parameters
    if (distortionRef.current) {
      distortionRef.current.distortion =
        typeof state.F1 === 'number' ? state.F1 : 0;
      distortionRef.current.wet.value =
        typeof state.F2 === 'number' ? state.F2 : 0;
    }

    if (delayRef.current) {
      delayRef.current.delayTime.value =
        typeof state.F3 === 'number' ? state.F3 : 0;
      delayRef.current.feedback.value =
        typeof state.F4 === 'number' ? state.F4 : 0;
      delayRef.current.wet.value = typeof state.F5 === 'number' ? state.F5 : 0;
    }

    if (reverbRef.current) {
      reverbRef.current.decay =
        typeof state.F6 === 'number' ? state.F6 * 10 : 1;
      reverbRef.current.preDelay =
        typeof state.F7 === 'number' ? state.F7 * 0.1 : 0;
      reverbRef.current.wet.value = typeof state.F8 === 'number' ? state.F8 : 0;
    }
  }, [state]);

  return null;
};

export default Synth;
