import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recommendationsAPI } from '../lib/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Lightbulb, Search, Check, X, AlertCircle } from 'lucide-react';

function RecommendPage() {
  var navigate = useNavigate();
  var auth = useAuth();
  var isAuthenticated = auth.isAuthenticated;
  
  var [title, setTitle] = useState('');
  var [author, setAuthor] = useState('');
  var [isAbo, setIsAbo] = useState(false);
  var [genresInput, setGenresInput] = useState('');
  var [genres, setGenres] = useState([]);
  var [reason, setReason] = useState('');
  var [submitting, setSubmitting] = useState(false);
  var [checking, setChecking] = useState(false);
  var [checkResult, setCheckResult] = useState(null);

  function handleAddGenre() {
    if (genresInput.trim() && genres.indexOf(genresInput.trim()) < 0) {
      setGenres(genres.concat([genresInput.trim()]));
      setGenresInput('');
    }
  }

  function handleRemoveGenre(genre) {
    setGenres(genres.filter(function(g) { return g !== genre; }));
  }

  function handleCheckBook() {
    if (!title.trim() || !author.trim()) {
      toast.error('Please enter both title and author to check');
      return;
    }
    setChecking(true);
    setCheckResult(null);
    recommendationsAPI.checkExists(title, author)
      .then(function(res) {
        setCheckResult(res.data);
      })
      .catch(function() {
        toast.error('Failed to check book');
      })
      .finally(function() {
        setChecking(false);
      });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      toast.error('Title and Author are required');
      return;
    }

    setSubmitting(true);
    recommendationsAPI.create({
      title: title,
      author: author,
      is_abo: isAbo,
      genres: genres,
      reason: reason,
    })
      .then(function() {
        toast.success('Recommendation submitted! Staff will review it soon.');
        setTitle('');
        setAuthor('');
        setIsAbo(false);
        setGenres([]);
        setReason('');
        setCheckResult(null);
      })
      .catch(function(error) {
        var message = error.response && error.response.data && error.response.data.detail;
        toast.error(message || 'Failed to submit recommendation');
      })
      .finally(function() {
        setSubmitting(false);
      });
  }

  function renderGenreBadges() {
    var items = [];
    for (var i = 0; i < genres.length; i++) {
      var genre = genres[i];
      items.push(
        <Badge key={genre} variant="secondary" className="rounded-full gap-1 pr-1">
          {genre}
          <button
            type="button"
            onClick={function(g) { return function() { handleRemoveGenre(g); }; }(genre)}
            className="ml-1 hover:bg-accent rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      );
    }
    return items;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12 px-4" data-testid="recommend-page">
        <div className="max-w-2xl mx-auto text-center">
          <Lightbulb className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold font-['Nunito'] mb-4">Recommend a Book</h1>
          <p className="text-muted-foreground mb-6">
            Please login to recommend books to our catalog.
          </p>
          <Button onClick={function() { navigate('/login'); }} className="rounded-xl">
            Login to Recommend
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12" data-testid="recommend-page">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Lightbulb className="h-12 w-12 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold font-['Nunito']">Recommend a Book</h1>
          <p className="text-muted-foreground mt-2">
            Know a BL book that's not in our catalog? Recommend it here!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-2xl p-6 lg:p-8">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <div className="flex gap-2">
              <Input
                id="title"
                value={title}
                onChange={function(e) { setTitle(e.target.value); setCheckResult(null); }}
                placeholder="Book title"
                className="rounded-xl"
                data-testid="recommend-title"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author *</Label>
            <div className="flex gap-2">
              <Input
                id="author"
                value={author}
                onChange={function(e) { setAuthor(e.target.value); setCheckResult(null); }}
                placeholder="Author name"
                className="rounded-xl flex-1"
                data-testid="recommend-author"
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-xl gap-2"
                onClick={handleCheckBook}
                disabled={checking}
                data-testid="check-book-btn"
              >
                <Search className="h-4 w-4" />
                {checking ? 'Checking...' : 'Check'}
              </Button>
            </div>
          </div>

          {checkResult && (
            <div className={'p-4 rounded-xl ' + (checkResult.exists ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-green-500/10 border border-green-500/30')}>
              {checkResult.exists ? (
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-500">Book already exists!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      "{checkResult.book.title}" by {checkResult.book.author} is already in our catalog.
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto mt-2"
                      onClick={function() { navigate('/book/' + checkResult.book.id); }}
                    >
                      View this book →
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-500">Book not found in catalog</p>
                    <p className="text-sm text-muted-foreground">You can submit this recommendation!</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex items-center gap-3">
              <Switch
                id="isAbo"
                checked={isAbo}
                onCheckedChange={setIsAbo}
                data-testid="recommend-abo-switch"
              />
              <Label htmlFor="isAbo" className="cursor-pointer">
                {isAbo ? 'ABO (Alpha/Beta/Omega)' : 'Non-ABO'}
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Genres (optional)</Label>
            <div className="flex gap-2">
              <Input
                value={genresInput}
                onChange={function(e) { setGenresInput(e.target.value); }}
                placeholder="Add genre (e.g., Romance, Drama)"
                className="rounded-xl"
                onKeyDown={function(e) {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGenre();
                  }
                }}
                data-testid="recommend-genre-input"
              />
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl"
                onClick={handleAddGenre}
              >
                Add
              </Button>
            </div>
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {renderGenreBadges()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Why recommend this book? (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={function(e) { setReason(e.target.value); }}
              placeholder="Tell us why you love this book..."
              className="rounded-xl min-h-24"
              data-testid="recommend-reason"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl gap-2"
            disabled={submitting || (checkResult && checkResult.exists)}
            data-testid="recommend-submit"
          >
            <Lightbulb className="h-4 w-4" />
            {submitting ? 'Submitting...' : 'Submit Recommendation'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default RecommendPage;
