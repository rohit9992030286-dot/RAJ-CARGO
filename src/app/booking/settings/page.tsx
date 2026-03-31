
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Loader2, Printer } from 'lucide-react';
import { useWaybillInventory } from '@/hooks/useWaybillInventory';
import { cn } from '@/lib/utils';


type Theme = 'light' | 'dark' | 'system';

function SettingsPageContent() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const storedTheme = localStorage.getItem('yuwon-theme') as Theme | null;
    if (storedTheme) setTheme(storedTheme);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('yuwon-theme', newTheme);
    if (newTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    } else {
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
    toast({
      title: 'Theme Updated',
      description: `Switched to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme.`,
    });
  };
  

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences.</p>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div>
                <Label className="font-medium">Theme</Label>
                <RadioGroup value={theme} onValueChange={(value: Theme) => handleThemeChange(value)} className="grid grid-cols-3 gap-4 mt-2">
                    <Label htmlFor="theme-light" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                        <Sun className="h-6 w-6 mb-2" />
                        <span>Light</span>
                    </Label>
                    <Label htmlFor="theme-dark" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                        <Moon className="h-6 w-6 mb-2" />
                        <span>Dark</span>
                    </Label>
                    <Label htmlFor="theme-system" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mb-2"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                        <span>System</span>
                    </Label>
                </RadioGroup>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}


export default function SettingsPage() {
  const { isInventoryLoaded } = useWaybillInventory();

  if (!isInventoryLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return <SettingsPageContent />;
}

    