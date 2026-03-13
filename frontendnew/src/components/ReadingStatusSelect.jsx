import React, { useState, useEffect } from 'react';
import { readingAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { BookmarkPlus, BookOpen } from 'lucide-react';

const readingStatuses = [
  { value: 'unread', label: 'Unread', color: 'text-muted-foreground' },
  { value: 'want_to_read', label: 'Want to Read', color: 'text-purple-400' },
  { value: 'reading', label: 'Reading', color: 'text-blue-400' },
  { value: 'completed', label: 'Completed', color: 'text-green-400' },
  { value: 'on_hold', label: 'On Hold', color: 'text-yellow-400' },
  { value: 'dnf', label: 'DNF', color: 'text-red-400' },
  { value: 'read', label: 'Read', color: 'text-emerald-400' },
];

const ReadingStatusSelect = ({ bookId, initialStatus, initialChapter, onUpdate }) => {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState(initialStatus || '');
  const [chapter, setChapter] = useState(initialChapter || '');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus(initialStatus || '');
    setChapter(initialChapter || '');
  }, [initialStatus, initialChapter]);

  const handleSave = async () => {
    if (!status) {
      toast.error('Please select a status');
      return;
    }

    setLoading(true);
    try {
      await readingAPI.setStatus({
        book_id: bookId,
        status,
        chapter: chapter ? parseInt(chapter, 10) : null,
      });
      toast.success('Reading status updated!');
      setIsOpen(false);
      if (onUpdate) onUpdate({ status, chapter });
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const currentStatus = readingStatuses.find((s) => s.value === status);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={status ? 'secondary' : 'default'}
          className="rounded-xl gap-2"
          data-testid="reading-status-btn"
        >
          {status ? (
            <>
              <BookOpen className={`h-4 w-4 ${currentStatus?.color}`} />
              <span className={currentStatus?.color}>{currentStatus?.label}</span>
            </>
          ) : (
            <>
              <BookmarkPlus className="h-4 w-4" />
              Add to Library
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-['Nunito']">Update Reading Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="rounded-xl" data-testid="status-select">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {readingStatuses.map((s) => (
                  <SelectItem
                    key={s.value}
                    value={s.value}
                    className={`rounded-lg ${s.color}`}
                  >
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Chapter (optional)</Label>
            <Input
              type="number"
              min="0"
              placeholder="Chapter number"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="rounded-xl"
              data-testid="chapter-input"
            />
            <p className="text-xs text-muted-foreground">
              Track which chapter you left off on
            </p>
          </div>

          <Button
            className="w-full rounded-xl"
            onClick={handleSave}
            disabled={loading}
            data-testid="save-status-btn"
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReadingStatusSelect;
