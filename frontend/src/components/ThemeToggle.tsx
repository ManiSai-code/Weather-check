import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export default function ThemeToggle({ isDarkMode, setIsDarkMode }: ThemeToggleProps) {
  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      type="button"
      className={`flex items-center justify-center p-1.5 rounded-xl border transition-all shadow-sm ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800/80' 
          : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-50'
      }`}
      style={{ height: '36px', width: '36px' }} // Explicitly sets it to half-size box format
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}