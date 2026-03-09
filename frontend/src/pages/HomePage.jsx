import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import BookCard from '../components/BookCard';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { BookHeart, ArrowRight, Sparkles } from 'lucide-react';

const HomePage = () => {
  const [topBooks, setTopBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isNeon } = useTheme();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await booksAPI.getTop(10);
        setTopBooks(res.data);
      } catch (error) {
        console.error('Failed to fetch top books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/30 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-6 ${isNeon ? 'neon-border' : ''}`}>
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Your BL Reading Companion</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-['Nunito'] leading-tight mb-6">
              Track Your Favorite
              <span className="text-primary block mt-2">BL Manhwa, Manhua, Manga, & Novels</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Create your personal checklist, track reading progress, and discover new titles. 
              From ABO to Non-ABO, we've got your reading list covered.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/checklists">
                <Button size="lg" className="rounded-xl gap-2" data-testid="explore-btn">
                  <BookHeart className="h-5 w-5" />
                  Explore
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="rounded-xl gap-2" data-testid="get-started-btn">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top 10 Books Section */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-['Nunito']">
                Top 10 Books
              </h2>
              <p className="text-muted-foreground mt-1">
                Community favorites based on ratings
              </p>
            </div>
            <Link to="/checklists">
              <Button variant="ghost" className="rounded-xl gap-2" data-testid="view-all-btn">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[2/3] rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : topBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {topBooks.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <BookHeart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold font-['Nunito'] mb-2">No Books Yet</h3>
              <p className="text-muted-foreground">
                Books will appear here once they're added to the catalog.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 lg:py-20 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-['Nunito'] mb-8 text-center">
            Browse by Category
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link to="/abo" data-testid="category-abo">
              <div className={`p-8 rounded-2xl bg-card border border-border book-card-hover ${isNeon ? 'neon-border' : ''}`}>
                <div className="abo-badge inline-block px-3 py-1 rounded-full text-sm font-medium mb-4">
                  ABO
                </div>
                <h3 className="text-xl font-bold font-['Nunito'] mb-2">Alpha/Beta/Omega</h3>
                <p className="text-muted-foreground text-sm">
                  Explore the omegaverse with dynamics, bonds, and heat cycles
                </p>
              </div>
            </Link>
            
            <Link to="/non-abo" data-testid="category-non-abo">
              <div className={`p-8 rounded-2xl bg-card border border-border book-card-hover ${isNeon ? 'neon-border' : ''}`}>
                <div className="non-abo-badge inline-block px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Non-ABO
                </div>
                <h3 className="text-xl font-bold font-['Nunito'] mb-2">Classic BL</h3>
                <p className="text-muted-foreground text-sm">
                  Traditional boys love stories without omegaverse elements
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
