import React from 'react';
import { useTheme, themes } from '../context/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Sun, Moon, Sparkles } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'light') return <Sun className="h-4 w-4" />;
    if (theme.startsWith('neon-')) return <Sparkles className="h-4 w-4" />;
    return <Moon className="h-4 w-4" />;
  };

  const getThemeColor = (themeId) => {
    switch (themeId) {
      case 'neon-blue': return 'text-cyan-400';
      case 'neon-pink': return 'text-pink-400';
      case 'neon-purple': return 'text-purple-400';
      default: return '';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl hover:bg-accent"
          data-testid="theme-toggle-btn"
        >
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`cursor-pointer rounded-lg ${theme === t.id ? 'bg-accent' : ''} ${getThemeColor(t.id)}`}
            data-testid={`theme-option-${t.id}`}
          >
            <span className="flex flex-col">
              <span className="font-medium">{t.name}</span>
              <span className="text-xs text-muted-foreground">{t.description}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
