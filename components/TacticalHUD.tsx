
import React, { useState, useEffect } from 'react';

const TacticalHUD: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatZulu = (date: Date) => {
    return date.toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' Z';
  };

  return (
    <header className="border-b-2 border-emerald-900 bg-zinc-950 p-4 flex justify-between items-center shadow-lg relative z-20">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-xs text-emerald-800 font-bold uppercase">Mission Time</span>
          <span className="text-lg font-bold glow-green">{formatZulu(time)}</span>
        </div>
        <div className="hidden md:flex flex-col border-l-2 border-emerald-900 pl-6">
          <span className="text-xs text-emerald-800 font-bold uppercase">Operation</span>
          <span className="text-lg font-bold text-emerald-500">STRIKE TEAM ECHO</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-xs text-emerald-800 font-bold uppercase">Signal Strength</span>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`h-3 w-1 ${i <= 4 ? 'bg-emerald-500' : 'bg-emerald-900'}`}></div>
            ))}
          </div>
        </div>
        <div className="h-10 w-10 border-2 border-emerald-500 flex items-center justify-center bg-emerald-500/10">
          <span className="text-xl font-bold">E</span>
        </div>
      </div>
    </header>
  );
};

export default TacticalHUD;
