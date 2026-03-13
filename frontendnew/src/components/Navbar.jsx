import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User, LogOut, Library, Settings, Menu, X, Lightbulb } from 'lucide-react';

function Navbar() {
  var auth = useAuth();
  var user = auth.user;
  var logout = auth.logout;
  var isAuthenticated = auth.isAuthenticated;
  var isStaff = auth.isStaff;
  var isOwner = auth.isOwner;
  var location = useLocation();
  var navigate = useNavigate();
  var [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  var navLinks = [
    { path: '/', label: 'Home' },
    { path: '/non-abo', label: 'Non ABO' },
    { path: '/abo', label: 'ABO' },
    { path: '/checklists', label: 'Full Checklists' },
    { path: '/recommend', label: 'Recommend' },
  ];

  function isActive(path) {
    return location.pathname === path;
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  function renderNavLinks() {
    var items = [];
    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      items.push(
        <Link
          key={link.path}
          to={link.path}
          className={'nav-link px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-accent ' + (isActive(link.path) ? 'text-primary active' : 'text-muted-foreground')}
          data-testid={'nav-link-' + (link.path.replace('/', '') || 'home')}
        >
          {link.label}
        </Link>
      );
    }
    return items;
  }

  function renderMobileNavLinks() {
    var items = [];
    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      items.push(
        <Link
          key={link.path}
          to={link.path}
          onClick={function() { setMobileMenuOpen(false); }}
          className={'px-4 py-3 rounded-xl text-sm font-medium transition-colors ' + (isActive(link.path) ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-accent/50')}
          data-testid={'mobile-nav-' + (link.path.replace('/', '') || 'home')}
        >
          {link.label}
        </Link>
      );
    }
    return items;
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center" data-testid="nav-logo">
            <img src="/logo.png" alt="Bonded Reads" className="h-16 sm:h-20 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {renderNavLinks()}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-xl gap-2" data-testid="user-menu-btn">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user ? user.username : ''}</span>
                    {isOwner && <span className="text-xs text-primary">(Owner)</span>}
                    {isStaff && !isOwner && <span className="text-xs text-muted-foreground">(Staff)</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem
                    onClick={function() { navigate('/library'); }}
                    className="cursor-pointer rounded-lg"
                    data-testid="menu-library"
                  >
                    <Library className="mr-2 h-4 w-4" />
                    My Library
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={function() { navigate('/my-recommendations'); }}
                    className="cursor-pointer rounded-lg"
                    data-testid="menu-my-recommendations"
                  >
                    <Lightbulb className="mr-2 h-4 w-4" />
                    My Recommendations
                  </DropdownMenuItem>
                  {isStaff && (
                    <DropdownMenuItem
                      onClick={function() { navigate('/admin'); }}
                      className="cursor-pointer rounded-lg"
                      data-testid="menu-admin"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer rounded-lg text-destructive"
                    data-testid="menu-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="rounded-xl"
                  onClick={function() { navigate('/login'); }}
                  data-testid="nav-login-btn"
                >
                  Login
                </Button>
                <Button
                  className="rounded-xl hidden sm:inline-flex"
                  onClick={function() { navigate('/register'); }}
                  data-testid="nav-register-btn"
                >
                  Sign Up
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl"
              onClick={function() { setMobileMenuOpen(!mobileMenuOpen); }}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-2">
              {renderMobileNavLinks()}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
