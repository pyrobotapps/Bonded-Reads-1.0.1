import React from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

var statuses = ['All', 'Ongoing', 'Completed', 'Hiatus'];

function FilterSidebar(props) {
  var filters = props.filters;
  var setFilters = props.setFilters;
  var genres = props.genres || [];
  var showAboFilter = props.showAboFilter;
  var isAboPage = props.isAboPage;

  function handleGenreToggle(genre) {
    var currentGenres = filters.genres || [];
    var newGenres;
    if (currentGenres.indexOf(genre) >= 0) {
      newGenres = currentGenres.filter(function(g) { return g !== genre; });
    } else {
      newGenres = currentGenres.concat([genre]);
    }
    setFilters(Object.assign({}, filters, { genres: newGenres }));
  }

  function clearFilters() {
    setFilters({
      search: '',
      status: 'All',
      genres: [],
      is_abo: isAboPage,
    });
  }

  function renderGenres() {
    var items = [];
    for (var i = 0; i < genres.length; i++) {
      var genre = genres[i];
      var isSelected = filters.genres && filters.genres.indexOf(genre) >= 0;
      items.push(
        <button
          key={genre}
          onClick={function(g) { return function() { handleGenreToggle(g); }; }(genre)}
          className={'genre-chip ' + (isSelected ? 'bg-primary text-primary-foreground' : '')}
          data-testid={'filter-genre-' + genre}
        >
          {genre}
        </button>
      );
    }
    return items;
  }

  function renderStatuses() {
    var items = [];
    for (var i = 0; i < statuses.length; i++) {
      var status = statuses[i];
      items.push(
        <SelectItem key={status} value={status} className="rounded-lg">
          {status}
        </SelectItem>
      );
    }
    return items;
  }

  function FilterContent() {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Search</Label>
          <Input
            placeholder="Search books..."
            value={filters.search || ''}
            onChange={function(e) { setFilters(Object.assign({}, filters, { search: e.target.value })); }}
            className="rounded-xl"
            data-testid="filter-search"
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status || 'All'}
            onValueChange={function(value) { setFilters(Object.assign({}, filters, { status: value })); }}
          >
            <SelectTrigger className="rounded-xl" data-testid="filter-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {renderStatuses()}
            </SelectContent>
          </Select>
        </div>

        {showAboFilter && isAboPage === null && (
          <div className="space-y-3">
            <Label>Category</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="abo-all"
                  checked={filters.is_abo === null}
                  onCheckedChange={function() { setFilters(Object.assign({}, filters, { is_abo: null })); }}
                  data-testid="filter-abo-all"
                />
                <Label htmlFor="abo-all" className="text-sm font-normal cursor-pointer">All</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="abo-yes"
                  checked={filters.is_abo === true}
                  onCheckedChange={function() { setFilters(Object.assign({}, filters, { is_abo: true })); }}
                  data-testid="filter-abo-yes"
                />
                <Label htmlFor="abo-yes" className="text-sm font-normal cursor-pointer">ABO Only</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="abo-no"
                  checked={filters.is_abo === false}
                  onCheckedChange={function() { setFilters(Object.assign({}, filters, { is_abo: false })); }}
                  data-testid="filter-abo-no"
                />
                <Label htmlFor="abo-no" className="text-sm font-normal cursor-pointer">Non-ABO Only</Label>
              </div>
            </div>
          </div>
        )}

        {genres.length > 0 && (
          <div className="space-y-3">
            <Label>Genres</Label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {renderGenres()}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={clearFilters}
          data-testid="filter-clear"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="hidden lg:block w-64 shrink-0">
        <div className="filter-panel sticky top-24">
          <h3 className="font-semibold font-['Nunito'] mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </h3>
          <FilterContent />
        </div>
      </div>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="rounded-xl gap-2" data-testid="mobile-filter-btn">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="font-['Nunito']">Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </React.Fragment>
  );
}

export default FilterSidebar;
