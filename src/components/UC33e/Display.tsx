interface DisplayProps {
  value: number;
}

export const Display: React.FC<DisplayProps> = ({ value }) => (
  <div className="w-24 h-12 bg-blue-900 rounded flex items-center justify-center">
    <span className="text-blue-400 font-mono text-2xl">{value.toFixed(2)}</span>
  </div>
);
