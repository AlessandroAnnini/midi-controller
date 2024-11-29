interface ControlProps {
  value: number;
  label: string;
  isActive?: boolean;
}

export const FaderControl: React.FC<ControlProps> = ({
  value = 0,
  label,
  isActive,
}) => (
  <div className="flex flex-col items-center gap-1">
    {/* Enhanced glow container */}
    <div
      className={`relative ${
        isActive ? 'shadow-xl shadow-blue-500/70' : ''
      } rounded-lg`}
      style={{ filter: isActive ? 'blur(1px)' : 'none' }}>
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
    </div>
    <div className="flex items-center justify-center w-6 h-6 ">
      <span className="text-xs  text-gray-400 mt-1">{label}</span>
    </div>
  </div>
);
