
import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageSender, MissionStatus, IntelligenceReport } from './types';
import TacticalHUD from './components/TacticalHUD';
import TacButton from './components/TacButton';
import { tacticalizeMessage, generateHQResponse, generateRandomIntel } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: MessageSender.HQ,
      callsign: 'OVERLORD',
      text: 'STRIKE TEAM ECHO, ESTABLISH COMMS. MISSION IS LIVE. PROVIDE STATUS REPORT.',
      timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' Z',
      tactical: true,
      priority: 'HIGH'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTacticalMode, setIsTacticalMode] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [intelReports, setIntelReports] = useState<IntelligenceReport[]>([]);
  const [coords, setCoords] = useState<{lat: string, lng: string}>({ lat: '34.0522 N', lng: '118.2437 W' });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Poll for intel
    const interval = setInterval(async () => {
      const intel = await generateRandomIntel();
      setIntelReports(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        content: intel,
        source: 'SIGINT'
      }, ...prev].slice(0, 5));
    }, 15000);

    // Get user location for immersion
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords({
          lat: `${pos.coords.latitude.toFixed(4)} ${pos.coords.latitude >= 0 ? 'N' : 'S'}`,
          lng: `${pos.coords.longitude.toFixed(4)} ${pos.coords.longitude >= 0 ? 'E' : 'W'}`
        });
      });
    }

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const zuluTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' Z';
    
    let processedText = inputText;
    if (isTacticalMode) {
      processedText = await tacticalizeMessage(inputText, 'ECHO-1');
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: MessageSender.USER,
      callsign: 'ECHO-1',
      text: processedText,
      timestamp: zuluTime,
      tactical: isTacticalMode
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsSending(false);

    // HQ Responds occasionally
    if (Math.random() > 0.4) {
      setTimeout(async () => {
        const hqReply = await generateHQResponse(updatedMessages);
        const hqMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: MessageSender.HQ,
          callsign: 'OVERLORD',
          text: hqReply,
          timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' Z',
          tactical: true,
          priority: 'MED'
        };
        setMessages(prev => [...prev, hqMsg]);
      }, 2000);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-emerald-500 crt-flicker">
      <TacticalHUD />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Mission Info */}
        <aside className="hidden md:flex w-72 flex-col border-r-2 border-emerald-900 bg-zinc-950 p-4 gap-6 overflow-y-auto">
          <section>
            <h3 className="text-xs text-emerald-800 font-bold uppercase mb-2">Operational Status</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>COMMS:</span>
                <span className="text-emerald-400">ENCRYPTED</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>THREAT:</span>
                <span className="text-amber-500">LEVEL 3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>LAT:</span>
                <span className="font-mono">{coords.lat}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>LNG:</span>
                <span className="font-mono">{coords.lng}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs text-emerald-800 font-bold uppercase mb-2">SIGINT Intel Feed</h3>
            <div className="space-y-4">
              {intelReports.map((report, i) => (
                <div key={i} className="text-xs border-l-2 border-emerald-800 pl-2 py-1 opacity-80">
                  <div className="text-[10px] text-emerald-700 font-bold">[{report.timestamp}] {report.source}</div>
                  <div className="italic">{report.content}</div>
                </div>
              ))}
              {intelReports.length === 0 && (
                <div className="text-xs italic text-emerald-900">Scanning for signals...</div>
              )}
            </div>
          </section>

          <section className="mt-auto">
            <div className="p-3 border-2 border-emerald-900 bg-emerald-950/20 text-[10px]">
              <div className="font-bold text-emerald-700 mb-1">WARNING:</div>
              THIS CHANNEL IS CLASSIFIED. ALL TRANSMISSIONS RECORDED.
            </div>
          </section>
        </aside>

        {/* Main Chat Area */}
        <section className="flex-1 flex flex-col bg-black/50 relative">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === MessageSender.USER ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex gap-3 mb-1 text-[10px] font-bold uppercase tracking-widest ${msg.sender === MessageSender.HQ ? 'text-red-500' : 'text-emerald-700'}`}>
                  <span>{msg.callsign}</span>
                  <span>//</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div 
                  className={`max-w-[85%] p-3 border-2 relative ${
                    msg.sender === MessageSender.USER 
                      ? 'bg-emerald-500/10 border-emerald-800 rounded-l-lg rounded-br-lg' 
                      : msg.sender === MessageSender.HQ
                        ? 'bg-red-500/5 border-red-900 rounded-r-lg rounded-bl-lg text-red-400'
                        : 'bg-zinc-900 border-zinc-700 rounded-r-lg rounded-bl-lg'
                  }`}
                >
                  {msg.priority === 'HIGH' && (
                    <div className="absolute -top-3 -left-3 bg-red-600 text-black text-[10px] font-bold px-1 animate-pulse">
                      URGENT
                    </div>
                  )}
                  <p className="text-sm md:text-base leading-relaxed font-mono">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-emerald-800 text-xs italic">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                TRANSMITTING ENCRYPTED PACKET...
              </div>
            )}
          </div>

          {/* Input Area */}
          <footer className="p-4 bg-zinc-950 border-t-2 border-emerald-900">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-tighter">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={isTacticalMode} 
                      onChange={(e) => setIsTacticalMode(e.target.checked)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${isTacticalMode ? 'border-emerald-500 bg-emerald-500/20' : 'border-emerald-900'}`}>
                      {isTacticalMode && <div className="w-2 h-2 bg-emerald-500"></div>}
                    </div>
                    <span className={isTacticalMode ? 'text-emerald-500' : 'text-emerald-900'}>Tactical Brevity Mode</span>
                  </label>
                  <div className="h-4 w-[1px] bg-emerald-900"></div>
                  <span className="text-emerald-800">Radio: Channel A-12</span>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input 
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="ENTER MESSAGE TO SQUAD..."
                      className="w-full bg-zinc-900 border-2 border-emerald-900 p-4 text-emerald-500 focus:outline-none focus:border-emerald-500 placeholder:text-emerald-900 uppercase font-bold tracking-widest text-sm"
                    />
                    <div className="absolute top-0 right-0 h-full w-1 bg-emerald-500/20"></div>
                  </div>
                  <TacButton 
                    type="submit" 
                    disabled={isSending || !inputText.trim()}
                    className="w-32"
                  >
                    Transmit
                  </TacButton>
                </div>
              </div>
            </form>
          </footer>
        </section>

        {/* Right Sidebar: Active Operatives */}
        <aside className="hidden lg:flex w-64 flex-col border-l-2 border-emerald-900 bg-zinc-950 p-4 gap-6">
          <section>
            <h3 className="text-xs text-emerald-800 font-bold uppercase mb-4">Squad Manifest</h3>
            <div className="space-y-3">
              {[
                { name: 'ECHO-1 (YOU)', status: 'ACTIVE', color: 'emerald' },
                { name: 'GHOST-2', status: 'INFIL', color: 'blue' },
                { name: 'REAPER-4', status: 'STANDBY', color: 'zinc' },
              ].map((op, i) => (
                <div key={i} className="flex flex-col p-2 border border-emerald-900 bg-zinc-900/50">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>{op.name}</span>
                    <span className={`h-2 w-2 rounded-full ${op.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`}></span>
                  </div>
                  <div className="text-[10px] text-emerald-800 mt-1 uppercase">{op.status}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-emerald-900/10 p-4 border border-emerald-800/50">
            <h4 className="text-[10px] font-bold text-emerald-700 mb-2 uppercase">System Health</h4>
            <div className="space-y-2">
              <div className="h-1 bg-emerald-900 w-full rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[85%]"></div>
              </div>
              <div className="h-1 bg-emerald-900 w-full rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[40%]"></div>
              </div>
            </div>
            <p className="text-[8px] mt-2 text-emerald-900">ENCRYPTION KEY: AES-256-MIL-TAC</p>
          </section>
        </aside>
      </main>
    </div>
  );
};

export default App;
