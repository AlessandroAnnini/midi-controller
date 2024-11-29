interface ControlProps {
  value: number;
  label: string;
  isActive?: boolean;
}

export const KnobControl: React.FC<ControlProps> = ({
  value = 0,
  label,
  isActive,
}) => {
  const rotation = -135 + value * 270;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0">
          <div className="absolute bottom-1 left-1 w-1 h-2 bg-gray-600" />
          <div className="absolute bottom-1 right-1 w-1 h-2 bg-gray-600" />
        </div>

        {/* Enhanced glow container */}
        <div
          className={`absolute inset-0 rounded-full ${
            isActive ? 'shadow-xl shadow-blue-500/70' : ''
          }`}
          style={{ filter: isActive ? 'blur(1px)' : 'none' }}>
          <div
            className="w-full h-full rounded-full bg-gray-800 border-2 border-gray-700 relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.1s ease-out',
            }}>
            <div className="absolute top-0 left-1/2 w-1 h-3 bg-blue-400 -translate-x-1/2" />
          </div>
        </div>
      </div>
      <span className="text-xs text-gray-400 mt-1">{label}</span>
    </div>
  );
};
