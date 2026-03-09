import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { booksAPI, recommendationsAPI, staffApplicationsAPI, staffAPI } from '../lib/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Settings, Plus, Pencil, Trash2, BookOpen, X, Upload, Download, Lightbulb, Users, Check, UserMinus, Crown } from 'lucide-react';

function AdminPage() {
  var navigate = useNavigate();
  var auth = useAuth();
  var isAuthenticated = auth.isAuthenticated;
  var isStaff = auth.isStaff;
  var isOwner = auth.isOwner;
  
  var [books, setBooks] = useState([]);
  var [recommendations, setRecommendations] = useState([]);
  var [staffApplications, setStaffApplications] = useState([]);
  var [staffList, setStaffList] = useState([]);
  var [loading, setLoading] = useState(true);
  var [activeTab, setActiveTab] = useState('books');
  var [dialogOpen, setDialogOpen] = useState(false);
  var [editingBook, setEditingBook] = useState(null);
  var [title, setTitle] = useState('');
  var [author, setAuthor] = useState('');
  var [coverUrl, setCoverUrl] = useState('');
  var [bookStatus, setBookStatus] = useState('Ongoing');
  var [isAbo, setIsAbo] = useState(false);
  var [description, setDescription] = useState('');
  var [genres, setGenres] = useState([]);
  var [genresInput, setGenresInput] = useState('');
  var [submitting, setSubmitting] = useState(false);
  var [importText, setImportText] = useState('');
  var [importing, setImporting] = useState(false);
  var [importOpen, setImportOpen] = useState(false);

  useEffect(function() {
    if (!isAuthenticated || !isStaff) {
      navigate('/staff-login');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isStaff, navigate]);

  function fetchData() {
    setLoading(true);
    booksAPI.getAll({ limit: 100 }).then(function(res) {
      setBooks(res.data);
      return recommendationsAPI.getAll('pending');
    }).then(function(res) {
      setRecommendations(res.data);
      if (isOwner) {
        return staffApplicationsAPI.getAll('pending');
      }
      return { data: [] };
    }).then(function(res) {
      setStaffApplications(res.data);
      if (isOwner) {
        return staffAPI.getList();
      }
      return { data: [] };
    }).then(function(res) {
      setStaffList(res.data);
    }).catch(function(err) {
      console.error(err);
    }).finally(function() {
      setLoading(false);
    });
  }

  function resetForm() {
    setTitle('');
    setAuthor('');
    setCoverUrl('');
    setBookStatus('Ongoing');
    setIsAbo(false);
    setDescription('');
    setGenres([]);
    setGenresInput('');
    setEditingBook(null);
  }

  function openEdit(book) {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setCoverUrl(book.cover_url || '');
    setBookStatus(book.status);
    setIsAbo(book.is_abo);
    setDescription(book.description || '');
    setGenres(book.genres || []);
    setDialogOpen(true);
  }

  function addGenre() {
    if (genresInput.trim() && genres.indexOf(genresInput.trim()) < 0) {
      setGenres(genres.concat([genresInput.trim()]));
      setGenresInput('');
    }
  }

  function removeGenre(g) {
    setGenres(genres.filter(function(x) { return x !== g; }));
  }

  function saveBook(e) {
    e.preventDefault();
    if (!title || !author) {
      toast.error('Title and Author required');
      return;
    }
    setSubmitting(true);
    var data = { title: title, author: author, cover_url: coverUrl || null, status: bookStatus, is_abo: isAbo, description: description, genres: genres };
    var p = editingBook ? booksAPI.update(editingBook.id, data) : booksAPI.create(data);
    p.then(function() {
      toast.success(editingBook ? 'Updated!' : 'Added!');
      setDialogOpen(false);
      resetForm();
      fetchData();
    }).catch(function() {
      toast.error('Failed to save');
    }).finally(function() {
      setSubmitting(false);
    });
  }

  function deleteBook(id) {
    booksAPI.delete(id).then(function() {
      toast.success('Deleted');
      setBooks(books.filter(function(b) { return b.id !== id; }));
    }).catch(function() {
      toast.error('Failed');
    });
  }

  function approveRec(id) {
    recommendationsAPI.approve(id).then(function() {
      toast.success('Approved!');
      fetchData();
    }).catch(function() {
      toast.error('Failed');
    });
  }

  function rejectRec(id) {
    recommendationsAPI.reject(id).then(function() {
      toast.success('Rejected');
      setRecommendations(recommendations.filter(function(r) { return r.id !== id; }));
    }).catch(function() {
      toast.error('Failed');
    });
  }

  function approveApp(id) {
    staffApplicationsAPI.approve(id).then(function() {
      toast.success('Approved!');
      fetchData();
    }).catch(function() {
      toast.error('Failed');
    });
  }

  function rejectApp(id) {
    staffApplicationsAPI.reject(id).then(function() {
      toast.success('Rejected');
      setStaffApplications(staffApplications.filter(function(a) { return a.id !== id; }));
    }).catch(function() {
      toast.error('Failed');
    });
  }

  function removeStaff(id) {
    staffAPI.remove(id).then(function() {
      toast.success('Removed');
      setStaffList(staffList.filter(function(s) { return s.id !== id; }));
    }).catch(function() {
      toast.error('Failed');
    });
  }

  function doImport() {
    if (!importText.trim()) {
      toast.error('Paste data first');
      return;
    }
    setImporting(true);
    try {
      var data = JSON.parse(importText);
      if (!Array.isArray(data)) data = [data];
      booksAPI.batchImport(data).then(function(res) {
        toast.success('Imported ' + res.data.imported + ' books');
        setImportOpen(false);
        setImportText('');
        fetchData();
      }).catch(function() {
        toast.error('Import failed');
      }).finally(function() {
        setImporting(false);
      });
    } catch (e) {
      toast.error('Invalid JSON');
      setImporting(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen py-12"><div className="max-w-7xl mx-auto px-4"><Skeleton className="h-10 w-48 mb-8" /><Skeleton className="h-96 rounded-2xl" /></div></div>;
  }

  return (
    <div className="min-h-screen py-8 lg:py-12" data-testid="admin-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-['Nunito'] flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />Admin Panel
              {isOwner && <Crown className="h-5 w-5 text-yellow-500" />}
            </h1>
            <p className="text-muted-foreground mt-2">{isOwner ? 'Owner - Full control' : 'Staff - Book management'}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-2 bg-transparent p-0 mb-6 h-auto">
            <TabsTrigger value="books" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"><BookOpen className="h-4 w-4 mr-2" />Books ({books.length})</TabsTrigger>
            <TabsTrigger value="recs" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"><Lightbulb className="h-4 w-4 mr-2" />Recommendations ({recommendations.length})</TabsTrigger>
            {isOwner && <TabsTrigger value="apps" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"><Users className="h-4 w-4 mr-2" />Applications ({staffApplications.length})</TabsTrigger>}
            {isOwner && <TabsTrigger value="staff" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"><Users className="h-4 w-4 mr-2" />Staff ({staffList.length})</TabsTrigger>}
          </TabsList>

          <TabsContent value="books">
            <div className="flex gap-2 mb-6">
              <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogTrigger asChild><Button variant="outline" className="rounded-xl gap-2"><Upload className="h-4 w-4" />Import</Button></DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader><DialogTitle>Batch Import (JSON)</DialogTitle></DialogHeader>
                  <Textarea value={importText} onChange={function(e) { setImportText(e.target.value); }} placeholder='[{"title":"...","author":"..."}]' className="min-h-40 font-mono text-sm" />
                  <Button onClick={doImport} disabled={importing} className="w-full rounded-xl">{importing ? 'Importing...' : 'Import'}</Button>
                </DialogContent>
              </Dialog>
              <Dialog open={dialogOpen} onOpenChange={function(o) { setDialogOpen(o); if (!o) resetForm(); }}>
                <DialogTrigger asChild><Button className="rounded-xl gap-2"><Plus className="h-4 w-4" />Add Book</Button></DialogTrigger>
                <DialogContent className="rounded-2xl max-w-lg">
                  <DialogHeader><DialogTitle>{editingBook ? 'Edit' : 'Add'} Book</DialogTitle></DialogHeader>
                  <form onSubmit={saveBook} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Title *</Label><Input value={title} onChange={function(e) { setTitle(e.target.value); }} /></div>
                      <div><Label>Author *</Label><Input value={author} onChange={function(e) { setAuthor(e.target.value); }} /></div>
                    </div>
                    <div><Label>Cover URL</Label><Input value={coverUrl} onChange={function(e) { setCoverUrl(e.target.value); }} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Status</Label><Select value={bookStatus} onValueChange={setBookStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Ongoing">Ongoing</SelectItem><SelectItem value="Completed">Completed</SelectItem><SelectItem value="Hiatus">Hiatus</SelectItem></SelectContent></Select></div>
                      <div><Label>Category</Label><div className="flex items-center gap-2 h-10"><Switch checked={isAbo} onCheckedChange={setIsAbo} /><span>{isAbo ? 'ABO' : 'Non-ABO'}</span></div></div>
                    </div>
                    <div><Label>Description</Label><Textarea value={description} onChange={function(e) { setDescription(e.target.value); }} /></div>
                    <div><Label>Genres</Label><div className="flex gap-2"><Input value={genresInput} onChange={function(e) { setGenresInput(e.target.value); }} onKeyDown={function(e) { if (e.key === 'Enter') { e.preventDefault(); addGenre(); } }} /><Button type="button" variant="secondary" onClick={addGenre}>Add</Button></div>
                      {genres.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{genres.map(function(g) { return <Badge key={g} variant="secondary">{g}<button type="button" onClick={function() { removeGenre(g); }} className="ml-1"><X className="h-3 w-3" /></button></Badge>; })}</div>}
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="bg-card border rounded-2xl overflow-hidden">
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Author</TableHead><TableHead>Cat</TableHead><TableHead>Status</TableHead><TableHead>Rating</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {books.map(function(b) {
                    return <TableRow key={b.id}><TableCell className="font-medium">{b.title}</TableCell><TableCell>{b.author}</TableCell><TableCell><Badge className={b.is_abo ? 'abo-badge' : 'non-abo-badge'}>{b.is_abo ? 'ABO' : 'Non-ABO'}</Badge></TableCell><TableCell><Badge variant="outline">{b.status}</Badge></TableCell><TableCell>{(b.total_rating || 0).toFixed(1)}</TableCell><TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={function() { openEdit(b); }}><Pencil className="h-4 w-4" /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={function() { deleteBook(b.id); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></TableCell></TableRow>;
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="recs">
            <div className="space-y-4">
              {recommendations.length === 0 ? <div className="text-center py-12 bg-card border rounded-2xl"><Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p>No pending recommendations</p></div> : recommendations.map(function(r) {
                return <div key={r.id} className="bg-card border rounded-2xl p-6"><div className="flex justify-between"><div><h3 className="font-semibold">{r.title}</h3><p className="text-muted-foreground">by {r.author}</p><Badge className={r.is_abo ? 'abo-badge' : 'non-abo-badge'}>{r.is_abo ? 'ABO' : 'Non-ABO'}</Badge>{r.reason && <p className="text-sm mt-2">"{r.reason}"</p>}<p className="text-xs text-muted-foreground mt-2">By {r.username}</p></div><div className="flex gap-2"><Button size="sm" onClick={function() { approveRec(r.id); }}><Check className="h-4 w-4 mr-1" />Approve</Button><Button size="sm" variant="outline" onClick={function() { rejectRec(r.id); }}><X className="h-4 w-4 mr-1" />Reject</Button></div></div></div>;
              })}
            </div>
          </TabsContent>

          {isOwner && <TabsContent value="apps">
            <div className="space-y-4">
              {staffApplications.length === 0 ? <div className="text-center py-12 bg-card border rounded-2xl"><Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p>No pending applications</p></div> : staffApplications.map(function(a) {
                return <div key={a.id} className="bg-card border rounded-2xl p-6"><div className="flex justify-between"><div><h3 className="font-semibold">{a.username}</h3><p className="text-sm text-muted-foreground">{a.email}</p><p className="text-sm mt-2">"{a.reason}"</p></div><div className="flex gap-2"><Button size="sm" onClick={function() { approveApp(a.id); }}><Check className="h-4 w-4 mr-1" />Approve</Button><Button size="sm" variant="outline" onClick={function() { rejectApp(a.id); }}><X className="h-4 w-4 mr-1" />Reject</Button></div></div></div>;
              })}
            </div>
          </TabsContent>}

          {isOwner && <TabsContent value="staff">
            <div className="bg-card border rounded-2xl overflow-hidden">
              <Table>
                <TableHeader><TableRow><TableHead>Username</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {staffList.map(function(s) {
                    return <TableRow key={s.id}><TableCell>{s.username}</TableCell><TableCell>{s.email}</TableCell><TableCell>{s.is_owner ? <Badge className="bg-yellow-500/20 text-yellow-400"><Crown className="h-3 w-3 mr-1" />Owner</Badge> : <Badge variant="outline">Staff</Badge>}</TableCell><TableCell>{!s.is_owner && <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><UserMinus className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove staff?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={function() { removeStaff(s.id); }}>Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}</TableCell></TableRow>;
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>}
        </Tabs>
      </div>
    </div>
  );
}

export default AdminPage;
