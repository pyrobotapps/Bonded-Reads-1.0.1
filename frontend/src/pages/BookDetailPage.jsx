import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksAPI, votingAPI, readingAPI, notesAPI, listsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StarRating from '../components/StarRating';
import ReadingStatusSelect from '../components/ReadingStatusSelect';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Skeleton } from '../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { ArrowLeft, Plus, MessageSquare, User, Trash2, ListPlus } from 'lucide-react';

var placeholderCover = 'https://images.unsplash.com/photo-1689230053630-cb51e7b90fc1?w=400';

function BookDetailPage() {
  var params = useParams();
  var id = params.id;
  var navigate = useNavigate();
  var auth = useAuth();
  var isAuthenticated = auth.isAuthenticated;
  var user = auth.user;
  var theme = useTheme();
  var isNeon = theme.isNeon;
  
  var [book, setBook] = useState(null);
  var [loading, setLoading] = useState(true);
  var [myVote, setMyVote] = useState(null);
  var [readingStatus, setReadingStatus] = useState(null);
  var [notes, setNotes] = useState([]);
  var [lists, setLists] = useState([]);
  var [newNote, setNewNote] = useState('');
  var [isPublic, setIsPublic] = useState(false);
  var [noteLoading, setNoteLoading] = useState(false);
  var [selectedList, setSelectedList] = useState('');

  useEffect(function() {
    async function fetchData() {
      setLoading(true);
      try {
        var bookRes = await booksAPI.getOne(id);
        setBook(bookRes.data);

        var notesRes = await notesAPI.getPublic(id);
        setNotes(notesRes.data);

        if (isAuthenticated) {
          try {
            var voteRes = await votingAPI.getMyVote(id);
            setMyVote(voteRes.data.rating);
          } catch (e) { }

          try {
            var statusRes = await readingAPI.getForBook(id);
            setReadingStatus(statusRes.data);
          } catch (e) { }

          try {
            var listsRes = await listsAPI.getAll();
            setLists(listsRes.data);
          } catch (e) { }

          try {
            var allNotesRes = await notesAPI.getForBook(id);
            setNotes(allNotesRes.data);
          } catch (e) { }
        }
      } catch (error) {
        console.error('Failed to fetch book:', error);
        toast.error('Failed to load book details');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, isAuthenticated]);

  function handleVote(rating) {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }
    votingAPI.vote(id, rating).then(function(res) {
      setMyVote(rating);
      setBook(function(prev) {
        if (!prev) return prev;
        return Object.assign({}, prev, {
          total_rating: res.data.total_rating,
          vote_count: res.data.vote_count,
        });
      });
      toast.success('Vote recorded!');
    }).catch(function() {
      toast.error('Failed to vote');
    });
  }

  function handleAddNote() {
    if (!newNote.trim()) {
      toast.error('Please write something');
      return;
    }
    setNoteLoading(true);
    notesAPI.create({
      book_id: id,
      content: newNote,
      is_public: isPublic,
    }).then(function(res) {
      setNotes([res.data].concat(notes));
      setNewNote('');
      setIsPublic(false);
      toast.success('Note added!');
    }).catch(function() {
      toast.error('Failed to add note');
    }).finally(function() {
      setNoteLoading(false);
    });
  }

  function handleDeleteNote(noteId) {
    notesAPI.delete(noteId).then(function() {
      setNotes(notes.filter(function(n) { return n.id !== noteId; }));
      toast.success('Note deleted');
    }).catch(function() {
      toast.error('Failed to delete note');
    });
  }

  function handleAddToList() {
    if (!selectedList) {
      toast.error('Please select a list');
      return;
    }
    listsAPI.addBook(selectedList, id).then(function() {
      toast.success('Added to list!');
      setSelectedList('');
    }).catch(function() {
      toast.error('Failed to add to list');
    });
  }

  function renderListOptions() {
    var items = [];
    for (var i = 0; i < lists.length; i++) {
      var list = lists[i];
      items.push(
        <SelectItem key={list.id} value={list.id} className="rounded-lg">
          {list.name}
        </SelectItem>
      );
    }
    return items;
  }

  function renderGenres() {
    if (!book || !book.genres) return null;
    var items = [];
    for (var i = 0; i < book.genres.length; i++) {
      items.push(
        <span key={book.genres[i]} className="genre-chip">
          {book.genres[i]}
        </span>
      );
    }
    return items;
  }

  function renderNotes() {
    if (notes.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No notes yet. Be the first to share your thoughts!</p>
        </div>
      );
    }
    
    var items = [];
    for (var i = 0; i < notes.length; i++) {
      var note = notes[i];
      var isOwner = user && user.id === note.user_id;
      items.push(
        <div key={note.id} className="bg-card border border-border rounded-2xl p-6" data-testid={'note-' + note.id}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">{note.username}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(note.created_at).toLocaleDateString()}
                  {!note.is_public && ' • Private'}
                </p>
              </div>
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-destructive"
                onClick={function() { handleDeleteNote(note.id); }}
                data-testid={'delete-note-' + note.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-foreground leading-relaxed">{note.content}</p>
        </div>
      );
    }
    return items;
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <Skeleton className="aspect-[2/3] rounded-2xl" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-['Nunito'] mb-2">Book Not Found</h2>
          <Button onClick={function() { navigate(-1); }} className="rounded-xl">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12" data-testid="book-detail-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="rounded-xl gap-2 mb-8"
          onClick={function() { navigate(-1); }}
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <div className={'rounded-2xl overflow-hidden ' + (isNeon ? 'neon-border' : 'border border-border')}>
              <img
                src={book.cover_url || placeholderCover}
                alt={book.title}
                className="w-full aspect-[2/3] object-cover"
                onError={function(e) { e.target.src = placeholderCover; }}
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={book.is_abo ? 'abo-badge' : 'non-abo-badge'}>
                  {book.is_abo ? 'ABO' : 'Non-ABO'}
                </Badge>
                <Badge className="bg-secondary text-secondary-foreground">
                  {book.status}
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-['Nunito'] mb-2" data-testid="book-title">
                {book.title}
              </h1>
              <p className="text-xl text-muted-foreground" data-testid="book-author">
                by {book.author}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Community Rating</p>
                <StarRating rating={book.total_rating || 0} readonly size="lg" />
                <p className="text-sm text-muted-foreground mt-1">
                  {book.vote_count || 0} votes
                </p>
              </div>
              {isAuthenticated && (
                <div className="border-l border-border pl-4">
                  <p className="text-sm text-muted-foreground mb-1">Your Rating</p>
                  <StarRating
                    rating={myVote || 0}
                    onRate={handleVote}
                    size="lg"
                    showValue={false}
                  />
                </div>
              )}
            </div>

            {book.genres && book.genres.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Genres</p>
                <div className="flex flex-wrap gap-2">
                  {renderGenres()}
                </div>
              </div>
            )}

            {book.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-foreground leading-relaxed">{book.description}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-4">
              <ReadingStatusSelect
                bookId={id}
                initialStatus={readingStatus ? readingStatus.status : null}
                initialChapter={readingStatus ? readingStatus.chapter : null}
                onUpdate={setReadingStatus}
              />

              {isAuthenticated && lists.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-xl gap-2" data-testid="add-to-list-btn">
                      <ListPlus className="h-4 w-4" />
                      Add to List
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="font-['Nunito']">Add to List</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Select value={selectedList} onValueChange={setSelectedList}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select a list" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {renderListOptions()}
                        </SelectContent>
                      </Select>
                      <Button className="w-full rounded-xl" onClick={handleAddToList}>
                        Add to List
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 lg:mt-16">
          <h2 className="text-2xl font-bold font-['Nunito'] mb-6 flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Notes & Reviews
          </h2>

          {isAuthenticated && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <Textarea
                placeholder="Write your thoughts about this book..."
                value={newNote}
                onChange={function(e) { setNewNote(e.target.value); }}
                className="rounded-xl mb-4 min-h-24"
                data-testid="note-textarea"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                    data-testid="note-public-switch"
                  />
                  <Label htmlFor="public" className="text-sm cursor-pointer">
                    Make public
                  </Label>
                </div>
                <Button
                  onClick={handleAddNote}
                  disabled={noteLoading}
                  className="rounded-xl gap-2"
                  data-testid="add-note-btn"
                >
                  <Plus className="h-4 w-4" />
                  {noteLoading ? 'Adding...' : 'Add Note'}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {renderNotes()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;
