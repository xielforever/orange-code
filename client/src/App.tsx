import React, { useState, useRef, useEffect } from 'react';
import { useOrangeWebSocket } from './hooks/useOrangeWebSocket';
import { 
  Folder, FileCode2, FileJson, FileText, Settings, 
  Terminal, Play, Activity, CheckCircle2, Zap, Send,
  Cpu, Code2, PanelRightClose, PanelLeftClose
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock File Tree Component
const FileTreeItem = ({ icon: Icon, name, active = false, indent = 0 }: any) => (
  <div 
    className={`flex items-center gap-2 py-1.5 px-3 mx-2 my-0.5 rounded cursor-pointer transition-colors
      ${active ? 'bg-orange-500/10 text-orange-400' : 'hover:bg-surface-300 text-gray-400 hover:text-gray-200'}`}
    style={{ paddingLeft: `${indent * 12 + 12}px` }}
  >
    <Icon size={14} className={active ? 'text-orange-400' : 'text-gray-500'} />
    <span className="truncate text-xs font-medium">{name}</span>
  </div>
);

function App() {
  const { isConnected, messages, sendMessage } = useOrangeWebSocket(34567);
  const [input, setInput] = useState('');
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && isConnected) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-screen bg-surface-900 text-gray-300 overflow-hidden font-sans selection:bg-orange-500/30">
      
      {/* Left Sidebar (File Explorer) */}
      <AnimatePresence initial={false}>
        {leftOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col border-r border-surface-300 bg-surface-100/50 backdrop-blur-xl shrink-0"
          >
            {/* Header */}
            <div className="h-12 flex items-center px-4 border-b border-surface-300 shrink-0">
              <div className="flex items-center gap-2 text-orange-500">
                <Terminal size={18} />
                <span className="font-bold tracking-wide text-sm">WORKSPACE</span>
              </div>
            </div>

            {/* Explorer */}
            <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
              <div className="px-4 mb-2 text-[10px] font-bold text-gray-500 tracking-wider">PROJECT</div>
              <FileTreeItem icon={Folder} name="src" indent={0} />
              <FileTreeItem icon={FileCode2} name="App.tsx" indent={1} active />
              <FileTreeItem icon={FileCode2} name="main.tsx" indent={1} />
              <FileTreeItem icon={Folder} name="components" indent={1} />
              <FileTreeItem icon={FileCode2} name="Button.tsx" indent={2} />
              <FileTreeItem icon={Folder} name="hooks" indent={1} />
              <FileTreeItem icon={FileCode2} name="useOrange.ts" indent={2} />
              <FileTreeItem icon={FileJson} name="package.json" indent={0} />
              <FileTreeItem icon={FileJson} name="tsconfig.json" indent={0} />
              <FileTreeItem icon={FileText} name="README.md" indent={0} />
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-surface-300 shrink-0 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-surface-300 hover:bg-surface-400 rounded text-xs transition-colors">
                <Settings size={14} /> Settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content (Chat & Interaction) */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface-900 relative">
        
        {/* Top Navigation */}
        <header className="h-12 flex items-center justify-between px-4 border-b border-surface-300 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setLeftOpen(!leftOpen)} className="text-gray-500 hover:text-gray-300 transition-colors">
              <PanelLeftClose size={18} className={!leftOpen ? "rotate-180" : ""} />
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-surface-100 px-3 py-1 rounded-full border border-surface-300">
              <span className="flex h-2 w-2 relative">
                {isConnected ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                )}
              </span>
              {isConnected ? 'Agent Connected' : 'Disconnected'}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setRightOpen(!rightOpen)} className="text-gray-500 hover:text-gray-300 transition-colors">
              <PanelRightClose size={18} className={!rightOpen ? "rotate-180" : ""} />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-3xl mx-auto w-full space-y-6">
            
            {/* Intro / Empty State */}
            {!messages && (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-50">
                <div className="h-16 w-16 bg-surface-100 rounded-2xl flex items-center justify-center border border-surface-300 shadow-2xl">
                  <Cpu size={32} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-200">Orange Code Agent</h2>
                  <p className="text-xs text-gray-500 max-w-sm mt-1">
                    Powered by Rust backend. I can help you read, write, and execute code within your workspace safely.
                  </p>
                </div>
              </div>
            )}

            {/* Chat Stream (Very basic implementation for now) */}
            {messages && (
              <div className="bg-surface-100/50 border border-surface-300 rounded-lg p-5 backdrop-blur-sm shadow-xl shadow-black/50">
                <div className="flex items-center gap-3 mb-3 border-b border-surface-300/50 pb-3">
                  <div className="bg-orange-500/20 p-1.5 rounded text-orange-400">
                    <Cpu size={16} />
                  </div>
                  <span className="text-xs font-bold text-gray-300">AGENT</span>
                </div>
                <div className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap font-mono">
                  {messages}
                  <span className="inline-block w-2 h-4 ml-1 bg-orange-500 animate-pulse align-middle"></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gradient-to-t from-surface-900 via-surface-900 to-transparent shrink-0">
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-xl opacity-20 group-focus-within:opacity-50 blur transition duration-500"></div>
            <div className="relative flex items-end bg-surface-100 border border-surface-300 rounded-xl shadow-2xl overflow-hidden focus-within:border-orange-500/50 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Orange Code to implement a feature or explain this codebase..."
                className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-500 p-4 max-h-48 min-h-[56px] resize-none focus:outline-none focus:ring-0 custom-scrollbar"
                rows={1}
              />
              <div className="p-3 shrink-0">
                <button 
                  onClick={handleSend}
                  disabled={!isConnected || !input.trim()}
                  className="bg-orange-500 hover:bg-orange-400 disabled:bg-surface-300 disabled:text-gray-500 text-white p-2 rounded-lg transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-orange-500/20 disabled:shadow-none"
                >
                  <Send size={16} className={isConnected && input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center px-2 py-1.5 mt-1">
              <div className="flex gap-4 text-[10px] text-gray-500 font-medium tracking-wide">
                <span className="flex items-center gap-1 hover:text-gray-300 cursor-pointer transition-colors"><Code2 size={12}/> /code</span>
                <span className="flex items-center gap-1 hover:text-gray-300 cursor-pointer transition-colors"><Terminal size={12}/> /terminal</span>
              </div>
              <div className="text-[10px] text-gray-500">
                <kbd className="font-sans px-1.5 py-0.5 bg-surface-300 rounded text-gray-400">↵</kbd> to send
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar (Function/Status Panel) */}
      <AnimatePresence initial={false}>
        {rightOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col border-l border-surface-300 bg-surface-100/50 backdrop-blur-xl shrink-0"
          >
            {/* Header */}
            <div className="h-12 flex items-center justify-between px-4 border-b border-surface-300 shrink-0">
              <span className="font-bold tracking-wide text-sm text-gray-300">INSPECTOR</span>
              <Activity size={16} className="text-gray-500" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              
              {/* Token Usage Widget */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-500 tracking-wider flex items-center gap-2">
                  <Zap size={14} className="text-orange-500" /> 
                  SESSION METRICS
                </div>
                <div className="bg-surface-200 border border-surface-400 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-gray-500 mb-1">PROMPT TOKENS</div>
                    <div className="font-mono text-lg text-gray-200">12,408</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 mb-1">COMPLETION</div>
                    <div className="font-mono text-lg text-orange-400">1,244</div>
                  </div>
                  <div className="col-span-2 pt-3 border-t border-surface-400">
                    <div className="text-[10px] text-gray-500 mb-1">CURRENT CONTEXT WINDOW</div>
                    <div className="w-full bg-surface-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-orange-600 to-orange-400 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <div className="text-right text-[10px] text-gray-500 mt-1">45% (88k / 200k)</div>
                  </div>
                </div>
              </div>

              {/* Code Preview Widget */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-500 tracking-wider flex items-center gap-2">
                  <Code2 size={14} className="text-orange-500" /> 
                  SCRATCHPAD
                </div>
                <div className="bg-[#0d0d0d] border border-surface-400 rounded-lg overflow-hidden flex flex-col h-48 shadow-inner">
                  <div className="bg-surface-300 px-3 py-1.5 text-[10px] font-mono text-gray-400 flex justify-between items-center">
                    <span>src/utils.rs</span>
                    <span className="text-orange-400 flex items-center gap-1"><CheckCircle2 size={10}/> Synced</span>
                  </div>
                  <div className="p-3 text-xs font-mono text-gray-300 flex-1 overflow-auto custom-scrollbar">
                    <span className="text-pink-400">pub</span> <span className="text-purple-400">fn</span> <span className="text-blue-400">calculate_hash</span>(data: <span className="text-orange-300">&</span>[<span className="text-teal-400">u8</span>]) -&gt; <span className="text-teal-400">String</span> {'{\n'}
                    {'  '}let <span className="text-blue-400">mut</span> hasher = Sha256::<span className="text-blue-400">new</span>();{'\n'}
                    {'  '}hasher.<span className="text-blue-400">update</span>(data);{'\n'}
                    {'  '}format!(<span className="text-green-400">{'"{:x}"'}</span>, hasher.<span className="text-blue-400">finalize</span>()){'\n'}
                    {'}'}
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-500 tracking-wider flex items-center gap-2">
                  <Terminal size={14} className="text-orange-500" /> 
                  RUST BACKEND
                </div>
                <div className="bg-surface-200 border border-surface-400 rounded-lg p-3 text-xs font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={isConnected ? "text-green-400" : "text-red-400"}>
                      {isConnected ? "Running" : "Offline"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Port:</span>
                    <span className="text-gray-300">34567</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Latency:</span>
                    <span className="text-gray-300">4ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Memory:</span>
                    <span className="text-gray-300">42 MB</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
