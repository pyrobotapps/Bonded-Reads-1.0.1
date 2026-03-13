import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Badge } from './ui/badge';

const BookCard = ({ book, index = 0 }) => {
  const navigate = useNavigate();

  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'completed') return 'status-completed';
    if (statusLower === 'ongoing') return 'status-ongoing';
    if (statusLower === 'hiatus') return 'status-on-hold';
    return 'bg-secondary text-secondary-foreground';
  };

  const placeholderCover = 'https://images.unsplash.com/photo-1689230053630-cb51e7b90fc1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHw0fHxhbmltZSUyMGJvb2slMjBjb3ZlciUyMHJvbWFuY2UlMjBpbGx1c3RyYXRpb258ZW58MHx8fHwxNzcwMTc3ODc2fDA&ixlib=rb-4.1.0&q=85';

  return (
    <div
      onClick={() => navigate(`/book/${book.id}`)}
      className={`book-card-hover cursor-pointer rounded-2xl bg-card border border-border overflow-hidden animate-fade-in-up stagger-${(index % 10) + 1}`}
      data-testid={`book-card-${book.id}`}
    >
      {/* Cover Image */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <img
          src={book.cover_url || placeholderCover}
          alt={book.title}
          className="book-cover w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src = placeholderCover;
          }}
        />
        {/* ABO Badge */}
        <div className="absolute top-2 left-2">
          <Badge
            className={`text-xs ${book.is_abo ? 'abo-badge' : 'non-abo-badge'}`}
          >
            {book.is_abo ? 'ABO' : 'Non-ABO'}
          </Badge>
        </div>
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={`text-xs status-badge ${getStatusClass(book.status)}`}>
            {book.status}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold font-['Nunito'] text-sm line-clamp-2 leading-tight">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {book.author}
        </p>
        
        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 ${
                  star <= Math.round(book.total_rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {book.total_rating?.toFixed(1) || '0.0'}
          </span>
          <span className="text-xs text-muted-foreground">
            ({book.vote_count || 0})
          </span>
        </div>

        {/* Genres */}
        {book.genres && book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {book.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="genre-chip text-[10px]"
              >
                {genre}
              </span>
            ))}
            {book.genres.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{book.genres.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;
