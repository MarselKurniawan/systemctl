import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/types/consultation';
import { mockMessages } from '@/data/mockData';

interface Props {
  clientName: string;
  disabled?: boolean;
}

export default function ChatRoom({ clientName, disabled }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || disabled) return;
    const newMsg: ChatMessage = {
      id: String(messages.length + 1),
      sender: 'Konsultan',
      message: input.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    };
    setMessages([...messages, newMsg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse-live" />
          <h3 className="text-sm font-bold tracking-tight">Chat Room</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            {clientName.charAt(0)}
          </div>
          <span className="text-xs font-semibold text-primary">{clientName}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'} animate-slide-in`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-semibold text-muted-foreground/70">{msg.sender}</span>
              <span className="text-[10px] text-muted-foreground/40">{msg.time}</span>
            </div>
            <div
              className={`max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed ${
                msg.isUser
                  ? 'bg-muted rounded-2xl rounded-br-md text-foreground'
                  : 'bg-primary text-primary-foreground rounded-2xl rounded-bl-md shadow-md shadow-primary/10'
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2 bg-card">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ketik pesan..."
          disabled={disabled}
          className="flex-1 h-10 px-4 rounded-xl bg-muted/50 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-all border-0"
        />
        <Button size="icon" onClick={sendMessage} disabled={disabled || !input.trim()} className="h-10 w-10 rounded-xl shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
