import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import { useQuran } from '@/context/QuranContext';
import { toast } from 'sonner';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useQuran();

  const handleRemove = (surahNumber: number, ayahNumber: number) => {
    removeBookmark(surahNumber, ayahNumber);
    toast.success('Bookmark removed');
  };

  const sortedBookmarks = [...bookmarks].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent/10 text-accent mb-4">
            <Bookmark className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your Bookmarks
          </h1>
          <p className="text-muted-foreground">
            {bookmarks.length > 0
              ? `You have ${bookmarks.length} saved ayah${bookmarks.length > 1 ? 's' : ''}`
              : 'Save ayahs for quick access later'}
          </p>
        </div>

        {/* Bookmarks List */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <Book className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No bookmarks yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start reading and bookmark your favorite ayahs
            </p>
            <Link to="/">
              <Button>Browse Quran</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedBookmarks.map((bookmark) => (
              <Card 
                key={`${bookmark.surahNumber}-${bookmark.ayahNumber}`}
                className="group animate-fade-in"
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <Link
                    to={`/surah/${bookmark.surahNumber}?ayah=${bookmark.ayahNumber}`}
                    className="flex-1 flex items-center gap-4 hover:text-primary transition-colors"
                  >
                    <div className="ayah-number shrink-0">
                      {bookmark.surahNumber}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {bookmark.surahName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Ayah {bookmark.ayahNumber}
                      </p>
                    </div>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(bookmark.surahNumber, bookmark.ayahNumber)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
