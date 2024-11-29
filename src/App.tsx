import { UC33eController } from '@/components/UC33e';
import { useController } from '@/hooks/useMidiController';
import { UT33e } from '@/device-maps/UC33e';

function App() {
  const { state, status, connectedDevices } = useController({
    controllers: UT33e,
    // debounceTime: 16, // ~60fps
    debounceTime: 1,
  });

  return (
    <>
      {/* <div className="container mx-auto p-4"> */}
      <div className="">
        <UC33eController
          state={state}
          status={status}
          connectedDevices={connectedDevices}
        />
      </div>
    </>
  );
}

export default App;
