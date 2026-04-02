import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      <div className="flex items-center justify-between px-4 py-3 border-b bg-primary/5">
        <h3 className="font-bold text-sm text-primary tracking-tight">Chat Room</h3>
        <span className="text-xs text-info font-semibold">{clientName}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-chat-other/20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}>
            <div className="text-[10px] text-muted-foreground mb-1 font-medium">
              {msg.sender} <span className="opacity-60">{msg.time}</span>
            </div>
            <div
              className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.isUser
                  ? 'bg-chat-other text-chat-other-foreground rounded-2xl rounded-br-md'
                  : 'bg-chat-user text-chat-user-foreground rounded-2xl rounded-bl-md'
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2 bg-card">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ketik pesan..."
          disabled={disabled}
          className="flex-1 bg-muted/50 border-0 h-10"
        />
        <Button size="icon" onClick={sendMessage} disabled={disabled || !input.trim()} className="h-10 w-10 shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
