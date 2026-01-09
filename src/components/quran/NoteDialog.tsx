import { useState, useEffect } from 'react';
import { StickyNote, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuran } from '@/context/QuranContext';
import { toast } from 'sonner';

interface NoteDialogProps {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
}

export default function NoteDialog({ surahNumber, ayahNumber, surahName }: NoteDialogProps) {
  const { getNote, addNote, removeNote } = useQuran();
  const [note, setNote] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const existingNote = getNote(surahNumber, ayahNumber);
  const hasNote = !!existingNote;

  useEffect(() => {
    if (isOpen) {
      setNote(existingNote || '');
    }
  }, [isOpen, existingNote]);

  const handleSave = () => {
    if (note.trim()) {
      addNote(surahNumber, ayahNumber, note.trim());
      toast.success('Note saved');
    }
    setIsOpen(false);
  };

  const handleDelete = () => {
    removeNote(surahNumber, ayahNumber);
    setNote('');
    toast.success('Note deleted');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 ${hasNote ? 'text-yellow-500' : 'text-muted-foreground'}`}
        >
          <StickyNote className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-yellow-500" />
            Personal Note
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {surahName} - Ayah {ayahNumber}
          </p>

          <Textarea
            placeholder="Write your thoughts, reflections, or tafsir notes here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[120px] resize-none"
          />

          <div className="flex gap-2">
            {hasNote && (
              <Button variant="outline" className="gap-2 text-destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button className="flex-1 gap-2" onClick={handleSave} disabled={!note.trim()}>
              <Save className="h-4 w-4" />
              Save Note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}