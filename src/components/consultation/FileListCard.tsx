import { useState, useEffect, useRef, useCallback } from 'react';
import { FileIcon, Download, FolderOpen, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatFile } from '@/types/consultation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { uploadToExternalStorage } from '@/lib/externalStorage';

interface Props {
  consultationId: string;
}

export default function FileListCard({ consultationId }: Props) {
  const { user } = useAuth();
  const [files, setFiles] = useState<ChatFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    // Get files from chat_messages + direct uploads
    const { data } = await supabase
      .from('chat_messages')
      .select('file_url, file_name, file_size, file_type')
      .eq('consultation_id', consultationId)
      .not('file_url', 'is', null)
      .order('created_at', { ascending: false });

    if (data) {
      const mapped: ChatFile[] = data.map(m => ({
        name: m.file_name || 'File',
        size: m.file_size || '',
        url: m.file_url!,
        type: m.file_type || '',
      }));
      setFiles(mapped);
    }
    setLoading(false);
  }, [consultationId]);

  useEffect(() => {
    fetchFiles();

    const channel = supabase
      .channel(`files-${consultationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `consultation_id=eq.${consultationId}`,
      }, (payload: any) => {
        if (payload.new.file_url) fetchFiles();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [consultationId, fetchFiles]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const result = await uploadToExternalStorage(file, `files-${consultationId}`);

    if (!result.success || !result.url) {
      toast.error('Gagal upload file: ' + (result.error || 'Unknown error'));
      setUploading(false);
      e.target.value = '';
      return;
    }

    // Save as a chat_message record so it appears in file list
    await supabase.from('chat_messages').insert({
      consultation_id: consultationId,
      sender_user_id: user.id,
      sender_name: 'System',
      message: `📎 ${file.name}`,
      file_url: result.url,
      file_name: file.name,
      file_size: formatSize(file.size),
      file_type: file.type,
    });

    toast.success('File berhasil diupload');
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div className="bg-card rounded-lg border">
      <div className="px-4 py-3 border-b flex items-center gap-2 flex-wrap">
        <FolderOpen className="h-4 w-4 text-primary" />
        <h3 className="font-bold text-sm">File Konsultasi</h3>
        {files.length > 0 && !uploading && (
          <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {files.length} file
          </span>
        )}
        <div className="ml-auto">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
      <div className="p-3">
        {loading ? (
          <div className="text-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Memuat file...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-6">
            <FolderOpen className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Belum ada file. Klik Upload untuk menambahkan.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {files.map((f, i) => (
              <a
                key={i}
                href={f.url}
                download={f.name}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-muted transition-colors group"
              >
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  <FileIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{f.name}</p>
                  <p className="text-[10px] text-muted-foreground">{f.size}</p>
                </div>
                <Download className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
