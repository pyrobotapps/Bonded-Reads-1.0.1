import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { booksAPI, readingAPI, listsAPI, statsAPI } from '../lib/api';
import BookCard from '../components/BookCard';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Library,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
  Bookmark,
  Plus,
  Trash2,
  ListPlus,
} from 'lucide-react';

const LibraryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [readingStatuses, setReadingStatuses] = useState([]);
  const [books, setBooks] = useState({});
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [createListOpen, setCreateListOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('reading');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const statsRes = await statsAPI.getLibrary();
        setStats(statsRes.data);

        const statusRes = await readingAPI.getAll();
        setReadingStatuses(statusRes.data);

        const listsRes = await listsAPI.getAll();
        setLists(listsRes.data);

        // Fetch book details
        const bookIds = statusRes.data.map(function(s) { return s.book_id; });
        const listBookIds = listsRes.data.reduce(function(acc, l) {
          return acc.concat(l.book_ids);
        }, []);
        const allBookIds = Array.from(new Set(bookIds.concat(listBookIds)));

        const booksMap = {};
        for (let i = 0; i < allBookIds.length; i++) {
          try {
            const bookRes = await booksAPI.getOne(allBookIds[i]);
            booksMap[allBookIds[i]] = bookRes.data;
          } catch (e) {
            console.error('Failed to fetch book');
          }
        }
        setBooks(booksMap);
      } catch (error) {
        console.error('Failed to fetch library data:', error);
        toast.error('Failed to load library');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }
    try {
      const res = await listsAPI.create(newListName);
      setLists(lists.concat([res.data]));
      setNewListName('');
      setCreateListOpen(false);
      toast.success('List created!');
    } catch (error) {
      toast.error('Failed to create list');
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      await listsAPI.delete(listId);
      setLists(lists.filter(function(l) { return l.id !== listId; }));
      toast.success('List deleted');
    } catch (error) {
      toast.error('Failed to delete list');
    }
  };

  const getBooksByStatus = (status) => {
    const filtered = readingStatuses.filter(function(s) { return s.status === status; });
    const result = [];
    for (let i = 0; i < filtered.length; i++) {
      const book = books[filtered[i].book_id];
      if (book) {
        result.push(book);
      }
    }
    return result;
  };

  const renderBooks = (booksList) => {
    if (booksList.length === 0) {
      return (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No books in this category yet</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {booksList.map(function(book, index) {
          return <BookCard key={book.id} book={book} index={index} />;
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12" data-testid="library-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-['Nunito'] flex items-center gap-3">
              <Library className="h-8 w-8 text-primary" />
              My Library
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.username}!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-3xl font-bold font-['Nunito']">{stats?.total || 0}</p>
            <p className="text-sm text-muted-foreground">Total Books</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-3xl font-bold font-['Nunito'] text-blue-400">{stats?.reading || 0}</p>
            <p className="text-sm text-muted-foreground">Reading</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-3xl font-bold font-['Nunito'] text-green-400">{stats?.completed || 0}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-3xl font-bold font-['Nunito']">{lists.length}</p>
            <p className="text-sm text-muted-foreground">Custom Lists</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="flex flex-wrap justify-start gap-2 h-auto bg-transparent p-0 mb-6">
            <TabsTrigger value="reading" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2">
              <BookOpen className="h-4 w-4 mr-2" />
              Reading ({stats?.reading || 0})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed ({stats?.completed || 0})
            </TabsTrigger>
            <TabsTrigger value="want_to_read" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2">
              <Bookmark className="h-4 w-4 mr-2" />
              Want to Read ({stats?.want_to_read || 0})
            </TabsTrigger>
            <TabsTrigger value="on_hold" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              On Hold ({stats?.on_hold || 0})
            </TabsTrigger>
            <TabsTrigger value="dnf" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2">
              <XCircle className="h-4 w-4 mr-2" />
              DNF ({stats?.dnf || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reading">{renderBooks(getBooksByStatus('reading'))}</TabsContent>
          <TabsContent value="completed">{renderBooks(getBooksByStatus('completed'))}</TabsContent>
          <TabsContent value="want_to_read">{renderBooks(getBooksByStatus('want_to_read'))}</TabsContent>
          <TabsContent value="on_hold">{renderBooks(getBooksByStatus('on_hold'))}</TabsContent>
          <TabsContent value="dnf">{renderBooks(getBooksByStatus('dnf'))}</TabsContent>
        </Tabs>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-['Nunito'] flex items-center gap-2">
              <ListPlus className="h-6 w-6" />
              Custom Lists
            </h2>
            <Dialog open={createListOpen} onOpenChange={setCreateListOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl gap-2" data-testid="create-list-btn">
                  <Plus className="h-4 w-4" />
                  New List
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-['Nunito']">Create New List</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="List name (e.g., Favorites, To Buy)"
                    value={newListName}
                    onChange={function(e) { setNewListName(e.target.value); }}
                    className="rounded-xl"
                    data-testid="new-list-name"
                  />
                  <Button className="w-full rounded-xl" onClick={handleCreateList} data-testid="create-list-submit">
                    Create List
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {lists.length > 0 ? (
            <div className="space-y-6">
              {lists.map(function(list) {
                const listBooks = list.book_ids.map(function(bid) { return books[bid]; }).filter(Boolean);
                return (
                  <div key={list.id} className="bg-card border border-border rounded-2xl p-6" data-testid={'list-' + list.id}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold font-['Nunito']">{list.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl text-destructive"
                        onClick={function() { handleDeleteList(list.id); }}
                        data-testid={'delete-list-' + list.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {listBooks.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {listBooks.map(function(book) {
                          return <BookCard key={book.id} book={book} />;
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No books in this list yet. Add books from the book details page!
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <ListPlus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No custom lists yet</p>
              <p className="text-sm text-muted-foreground">Create one to organize your favorites!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
