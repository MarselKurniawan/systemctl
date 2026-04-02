import { FileIcon, Download, FolderOpen } from 'lucide-react';
import { ChatFile } from '@/types/consultation';

interface Props {
  files: ChatFile[];
}

export default function FileListCard({ files }: Props) {
  return (
    <div className="bg-card rounded-lg border">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <FolderOpen className="h-4 w-4 text-primary" />
        <h3 className="font-bold text-sm">File Konsultasi</h3>
        {files.length > 0 && (
          <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {files.length} file
          </span>
        )}
      </div>
      <div className="p-3">
        {files.length === 0 ? (
          <div className="text-center py-6">
            <FolderOpen className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Belum ada file</p>
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
