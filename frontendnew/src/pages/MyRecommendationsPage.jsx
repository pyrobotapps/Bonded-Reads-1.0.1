import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recommendationsAPI, staffApplicationsAPI } from '../lib/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Lightbulb, Clock, Check, X, UserPlus } from 'lucide-react';

function MyRecommendationsPage() {
  var navigate = useNavigate();
  var auth = useAuth();
  var isAuthenticated = auth.isAuthenticated;
  var isStaff = auth.isStaff;
  
  var [recs, setRecs] = useState([]);
  var [myApp, setMyApp] = useState(null);
  var [loading, setLoading] = useState(true);
  var [reason, setReason] = useState('');
  var [dialogOpen, setDialogOpen] = useState(false);
  var [submitting, setSubmitting] = useState(false);

  useEffect(function fetchOnMount() {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    async function loadData() {
      try {
        var recsRes = await recommendationsAPI.getMy();
        setRecs(recsRes.data);
        var appRes = await staffApplicationsAPI.getMy();
        setMyApp(appRes.data.application);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    loadData();
  }, [isAuthenticated, navigate]);

  async function handleApply() {
    if (!reason.trim()) {
      toast.error('Please enter a reason');
      return;
    }
    setSubmitting(true);
    try {
      var res = await staffApplicationsAPI.create(reason);
      toast.success('Applied!');
      setMyApp(res.data);
      setDialogOpen(false);
      setReason('');
    } catch (e) {
      var msg = e.response && e.response.data && e.response.data.detail;
      toast.error(msg || 'Failed');
    }
    setSubmitting(false);
  }

  function getStatusBadge(status) {
    if (status === 'pending') {
      return <Badge className="bg-yellow-500/20 text-yellow-400"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
    if (status === 'approved') {
      return <Badge className="bg-green-500/20 text-green-400"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
    }
    if (status === 'rejected') {
      return <Badge className="bg-red-500/20 text-red-400"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
    }
    return null;
  }

  function renderRecs() {
    if (recs.length === 0) {
      return (
        <div className="text-center py-12">
          <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No recommendations yet</p>
          <Button className="mt-4 rounded-xl" onClick={function() { navigate('/recommend'); }}>Recommend a Book</Button>
        </div>
      );
    }

    var items = [];
    for (var i = 0; i < recs.length; i++) {
      var r = recs[i];
      var genreTags = [];
      if (r.genres) {
        for (var j = 0; j < r.genres.length; j++) {
          genreTags.push(<span key={r.genres[j]} className="genre-chip text-xs">{r.genres[j]}</span>);
        }
      }
      items.push(
        <div key={r.id} className="bg-card border rounded-2xl p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold">{r.title}</h3>
              <p className="text-sm text-muted-foreground">by {r.author}</p>
            </div>
            {getStatusBadge(r.status)}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={r.is_abo ? 'abo-badge' : 'non-abo-badge'}>{r.is_abo ? 'ABO' : 'Non-ABO'}</Badge>
            {genreTags}
          </div>
          {r.reason && <p className="text-sm text-muted-foreground">{r.reason}</p>}
          <p className="text-xs text-muted-foreground mt-3">Submitted {new Date(r.created_at).toLocaleDateString()}</p>
        </div>
      );
    }
    return items;
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-10 w-64 mb-8" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32 mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12" data-testid="my-recommendations-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-['Nunito'] flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-primary" />
              My Recommendations
            </h1>
            <p className="text-muted-foreground mt-2">Track your book recommendations</p>
          </div>
          <Button onClick={function() { navigate('/recommend'); }} className="rounded-xl">New Recommendation</Button>
        </div>

        {!isStaff && (
          <div className="bg-card border rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserPlus className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Want to become Staff?</h3>
                  <p className="text-sm text-muted-foreground">Staff can add books directly</p>
                </div>
              </div>
              {myApp ? (
                <div className="text-right">
                  {getStatusBadge(myApp.status)}
                  <p className="text-xs text-muted-foreground mt-1">Applied {new Date(myApp.created_at).toLocaleDateString()}</p>
                </div>
              ) : (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl gap-2">
                      <UserPlus className="h-4 w-4" />Apply
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Apply for Staff</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Why do you want to be staff?</Label>
                        <Textarea 
                          value={reason} 
                          onChange={function(e) { setReason(e.target.value); }} 
                          placeholder="Tell us..." 
                          className="min-h-32" 
                        />
                      </div>
                      <Button onClick={handleApply} disabled={submitting} className="w-full rounded-xl">
                        {submitting ? 'Submitting...' : 'Submit'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {renderRecs()}
        </div>
      </div>
    </div>
  );
}

export default MyRecommendationsPage;
