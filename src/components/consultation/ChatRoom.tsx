import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, FileIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage, ChatFile } from '@/types/consultation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  consultationId: string;
  clientName: string;
  disabled?: boolean;
}

export default function ChatRoom({ consultationId, clientName, disabled }: Props) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const senderName = profile?.nama || 'User';

  // Fetch existing messages
  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: true });

    if (data) {
      const mapped: ChatMessage[] = data.map((m: any) => ({
        id: m.id,
        sender: m.sender_name,
        message: m.message,
        time: new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        isUser: m.sender_user_id === user?.id,
        file: m.file_url ? { name: m.file_name || '', size: m.file_size || '', url: m.file_url, type: m.file_type || '' } : undefined,
      }));
      setMessages(mapped);
    }
    setLoading(false);
  }, [consultationId, user?.id]);

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime
    const channel = supabase
      .channel(`chat-${consultationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `consultation_id=eq.${consultationId}`,
      }, (payload: any) => {
        const m = payload.new;
        const newMsg: ChatMessage = {
          id: m.id,
          sender: m.sender_name,
          message: m.message,
          time: new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isUser: m.sender_user_id === user?.id,
          file: m.file_url ? { name: m.file_name || '', size: m.file_size || '', url: m.file_url, type: m.file_type || '' } : undefined,
        };
        setMessages(prev => {
          if (prev.some(p => p.id === m.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [consultationId, user?.id, fetchMessages]);

  const prevMessagesLenRef = useRef(0);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (messages.length === 0) return;
    
    // Always scroll on initial load
    if (initialLoadRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
      initialLoadRef.current = false;
      prevMessagesLenRef.current = messages.length;
      return;
    }

    // Only scroll if new message is from current user
    if (messages.length > prevMessagesLenRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.isUser) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevMessagesLenRef.current = messages.length;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || disabled || !user) return;
    const text = input.trim();
    setInput('');

    await supabase.from('chat_messages').insert({
      consultation_id: consultationId,
      sender_user_id: user.id,
      sender_name: senderName,
      message: text,
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || disabled || !user) return;

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Upload to storage
    const filePath = `chat/${consultationId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('consultation-files')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      e.target.value = '';
      return;
    }

    const { data: urlData } = supabase.storage.from('consultation-files').getPublicUrl(filePath);
    const fileUrl = urlData.publicUrl;

    const chatFile: ChatFile = {
      name: file.name,
      size: formatSize(file.size),
      url: fileUrl,
      type: file.type,
    };

    await supabase.from('chat_messages').insert({
      consultation_id: consultationId,
      sender_user_id: user.id,
      sender_name: senderName,
      message: `📎 ${file.name}`,
      file_url: fileUrl,
      file_name: file.name,
      file_size: formatSize(file.size),
      file_type: file.type,
    });

    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-bold">Chat Room</h3>
        </div>
        <span className="text-xs font-semibold text-primary">{clientName}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && <p className="text-center text-xs text-muted-foreground">Memuat pesan...</p>}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-muted-foreground mb-0.5">{msg.sender} · {msg.time}</span>
            <div className={`max-w-[80%] px-3 py-2 text-[13px] leading-relaxed rounded-lg ${
              msg.isUser
                ? 'bg-muted text-foreground rounded-br-sm'
                : 'bg-primary text-primary-foreground rounded-bl-sm'
            }`}>
              {msg.file ? (
                <a href={msg.file.url} target="_blank" rel="noopener noreferrer" download={msg.file.name} className="flex items-center gap-2 hover:opacity-80 transition">
                  <FileIcon className="h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate text-xs">{msg.file.name}</p>
                    <p className="text-[10px] opacity-70">{msg.file.size}</p>
                  </div>
                  <Download className="h-3.5 w-3.5 shrink-0 ml-1" />
                </a>
              ) : (
                msg.message
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
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
