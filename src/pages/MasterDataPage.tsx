import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit2, Scale, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface MasterItem {
  id: string;
  nama: string;
}

interface Props {
  tableName: 'master_jenis_layanan' | 'master_jenis_hukum';
  title: string;
  subtitle: string;
  icon: typeof Scale;
}

export default function MasterDataPage({ tableName, title, subtitle, icon: Icon }: Props) {
  const [items, setItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MasterItem | null>(null);
  const [formNama, setFormNama] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    const { data } = await supabase.from(tableName).select('id, nama').order('created_at', { ascending: true });
    setItems((data as MasterItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [tableName]);

  const openAdd = () => { setEditItem(null); setFormNama(''); setShowModal(true); };
  const openEdit = (item: MasterItem) => { setEditItem(item); setFormNama(item.nama); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) { toast.error('Nama wajib diisi'); return; }
    setSaving(true);

    if (editItem) {
      const { error } = await supabase.from(tableName).update({ nama: formNama.trim() }).eq('id', editItem.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Data berhasil diperbarui');
    } else {
      const { error } = await supabase.from(tableName).insert({ nama: formNama.trim() });
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Data berhasil ditambahkan');
    }

    setSaving(false);
    setShowModal(false);
    fetchItems();
  };

  const handleDelete = async (item: MasterItem) => {
    if (!confirm(`Hapus "${item.nama}"?`)) return;
    const { error } = await supabase.from(tableName).delete().eq('id', item.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Data berhasil dihapus');
    fetchItems();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <Button onClick={openAdd} className="gap-2 font-semibold">
          <Plus className="h-4 w-4" /> Tambah
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat data...</div>
      ) : items.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <Icon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Belum ada data</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border divide-y">
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-sm">{item.nama}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(item)}>
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(item)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Data' : 'Tambah Data'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nama</Label>
              <Input value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Masukkan nama" autoFocus />
            </div>
            <Button type="submit" className="w-full font-bold" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
