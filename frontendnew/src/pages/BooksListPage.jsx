import React, { useState, useEffect } from 'react';
import { booksAPI } from '../lib/api';
import BookCard from '../components/BookCard';
import FilterSidebar from '../components/FilterSidebar';
import { Skeleton } from '../components/ui/skeleton';
import { BookX } from 'lucide-react';

function BooksListPage(props) {
  const title = props.title;
  const isAbo = props.isAbo;
  
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    genres: [],
    is_abo: isAbo,
  });

  // Reset filters when isAbo prop changes (navigating between pages)
  useEffect(function() {
    setFilters({
      search: '',
      status: 'All',
      genres: [],
      is_abo: isAbo,
    });
  }, [isAbo]);

  useEffect(function() {
    async function fetchGenres() {
      try {
        const res = await booksAPI.getGenres();
        setGenres(res.data);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    }
    fetchGenres();
  }, []);

  useEffect(function() {
    async function fetchBooks() {
      setLoading(true);
      try {
        const params = {};
        if (filters.is_abo !== null && filters.is_abo !== undefined) {
          params.is_abo = filters.is_abo;
        }
        if (filters.status && filters.status !== 'All') {
          params.status = filters.status;
        }
        if (filters.search) {
          params.search = filters.search;
        }
        
        const res = await booksAPI.getAll(params);
        setBooks(res.data);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [filters.is_abo, filters.status, filters.search]);

  useEffect(function() {
    if (!filters.genres || filters.genres.length === 0) {
      setFilteredBooks(books);
    } else {
      const filtered = [];
      for (var i = 0; i < books.length; i++) {
        var book = books[i];
        var bookGenres = book.genres || [];
        for (var j = 0; j < filters.genres.length; j++) {
          if (bookGenres.indexOf(filters.genres[j]) >= 0) {
            filtered.push(book);
            break;
          }
        }
      }
      setFilteredBooks(filtered);
    }
  }, [books, filters.genres]);

  function renderLoadingGrid() {
    var items = [];
    for (var i = 0; i < 12; i++) {
      items.push(
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[2/3] rounded-2xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      );
    }
    return items;
  }

  function renderBookGrid() {
    var items = [];
    for (var i = 0; i < filteredBooks.length; i++) {
      var book = filteredBooks[i];
      items.push(<BookCard key={book.id} book={book} index={i} />);
    }
    return items;
  }

  var pageId = isAbo === true ? 'abo' : isAbo === false ? 'non-abo' : 'all';

  return (
    <div className="min-h-screen py-8 lg:py-12" data-testid={'books-list-' + pageId}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-['Nunito']">{title}</h1>
          <p className="text-muted-foreground mt-2">
            {filteredBooks.length} books found
          </p>
        </div>

        <div className="flex gap-8">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            genres={genres}
            showAboFilter={isAbo === null}
            isAboPage={isAbo}
          />

          <div className="flex-1">
            <div className="lg:hidden mb-6">
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                genres={genres}
                showAboFilter={isAbo === null}
                isAboPage={isAbo}
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {renderLoadingGrid()}
              </div>
            ) : filteredBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {renderBookGrid()}
              </div>
            ) : (
              <div className="text-center py-20">
                <BookX className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold font-['Nunito'] mb-2">No Books Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or check back later.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BooksListPage;
