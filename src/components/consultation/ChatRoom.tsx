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
    setMessages([...messages, {
      id: String(messages.length + 1),
      sender: 'Konsultan',
      message: input.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse-live" />
          <h3 className="text-sm font-bold">Chat Room</h3>
        </div>
        <span className="text-xs font-semibold text-primary">{clientName}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-muted-foreground mb-0.5">{msg.sender} · {msg.time}</span>
            <div className={`max-w-[80%] px-3 py-2 text-[13px] leading-relaxed rounded-lg ${
              msg.isUser
                ? 'bg-muted text-foreground rounded-br-sm'
                : 'bg-primary text-primary-foreground rounded-bl-sm'
            }`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ketik pesan..."
          disabled={disabled}
          className="flex-1 h-9 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50 transition"
        />
        <Button size="icon" onClick={sendMessage} disabled={disabled || !input.trim()} className="h-9 w-9 shrink-0">
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
