
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth.tsx';
import { Moon, Sun, Trash2, Save, User, KeyRound, Building, MapPin, Phone, PlusCircle, Warehouse, Hash, Download, Loader2, AlertCircle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useWaybillInventory } from '@/hooks/useWaybillInventory';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { saveAs } from 'file-saver';
import { useGoogleLogin } from '@react-oauth/google';
import { saveToGoogleDrive } from '@/lib/gdrive';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Theme = 'light' | 'dark' | 'system';
type StickerSize = '4x6' | '3x2' | 'compact' | '75mm';

interface WaybillInventorySettingsProps {
    waybillInventory: string[];
    addWaybillToInventory: (waybillNumber: string) => boolean;
    removeWaybillFromInventory: (waybillNumber: string) => void;
}

function WaybillInventorySettings({ waybillInventory, addWaybillToInventory, removeWaybillFromInventory }: WaybillInventorySettingsProps) {
  const [newWaybillNumber, setNewWaybillNumber] = useState('');
  const { toast } = useToast();

  const handleAddRange = () => {
    const input = newWaybillNumber.trim();
    if (!input) {
      toast({ title: "Input cannot be empty", variant: "destructive" });
      return;
    }

    const rangeMatch = input.match(/^(\d+)-(\d+)$/);
    const prefixMatch = input.match(/^([a-zA-Z-]+)(\d+)-(\d+)$/);
    
    let addedCount = 0;
    let skippedCount = 0;

    const addSingle = (num: string) => {
        if (addWaybillToInventory(num)) {
            addedCount++;
        } else {
            skippedCount++;
        }
    }

    if (rangeMatch || prefixMatch) {
      let prefix = '';
      let start, end;

      if(prefixMatch) {
        prefix = prefixMatch[1];
        start = parseInt(prefixMatch[2], 10);
        end = parseInt(prefixMatch[3], 10);
      } else if (rangeMatch) {
        start = parseInt(rangeMatch[1], 10);
        end = parseInt(rangeMatch[2], 10);
      } else {
          toast({ title: "Invalid format", description: "Please use '101-200' or 'SW-101-200'.", variant: "destructive" });
          return;
      }

      if (isNaN(start) || isNaN(end) || start > end) {
        toast({ title: "Invalid Range", description: "Start number must be less than or equal to the end number.", variant: "destructive" });
        return;
      }
      
      const rangeSize = end - start + 1;
      if (rangeSize > 500) {
        toast({ title: "Range Too Large", description: "Please add a maximum of 500 numbers at a time.", variant: "destructive"});
        return;
      }

      for (let i = start; i <= end; i++) {
        addSingle(`${prefix}${i}`);
      }
    } else if (/^[a-zA-Z-]*\d+$/.test(input)) {
        addSingle(input);
    } else {
      toast({ title: "Invalid Format", description: "Please enter a single number (e.g., SW-101) or a range (e.g., SW-101-200).", variant: "destructive" });
      return;
    }

    if (addedCount > 0) {
        toast({ title: "Inventory Updated", description: `${addedCount} number(s) added. ${skippedCount} skipped (duplicates).` });
    } else if (skippedCount > 0) {
        toast({ title: "No Numbers Added", description: `All ${skippedCount} number(s) were duplicates.`, variant: "default" });
    }
    
    setNewWaybillNumber('');
  };


  const handleDeleteWaybill = (waybillNumber: string) => {
    removeWaybillFromInventory(waybillNumber);
    toast({ title: "Waybill number removed from inventory" });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Waybill Inventory</CardTitle>
        <CardDescription>Manage your pre-allocated waybill numbers. Enter a single number (e.g., SW-101) or a range (e.g., SW-101-200).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter number or range (e.g., 101-200)"
            value={newWaybillNumber}
            onChange={(e) => setNewWaybillNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddRange()}
          />
          <Button onClick={handleAddRange}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add to Inventory
          </Button>
        </div>
        <div className="border rounded-md max-h-60 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50">
              <TableRow>
                <TableHead>Available Waybill Numbers ({waybillInventory.length})</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waybillInventory.length > 0 ? (
                waybillInventory.map((wbNumber) => (
                  <TableRow key={wbNumber}>
                    <TableCell className="font-medium flex items-center gap-2"><Hash className="h-4 w-4 text-muted-foreground" /> {wbNumber}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleDeleteWaybill(wbNumber)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    Inventory is empty.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

interface SettingsPageContentProps extends WaybillInventorySettingsProps {}

function SettingsPageContent({ waybillInventory, addWaybillToInventory, removeWaybillFromInventory }: SettingsPageContentProps) {
  const { toast } = useToast();
  const { updateCredentials } = useAuth();
  const [theme, setTheme] = useState<Theme>('system');
  const [stickerSize, setStickerSize] = useState<StickerSize>('4x6');
  const [isDriveSaving, setIsDriveSaving] = useState(false);
  const isGoogleDriveConfigured = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const accountForm = useForm({
    defaultValues: { username: '', password: '' },
  });

  const senderForm = useForm({
    defaultValues: {
      senderName: '',
      senderAddress: '',
      senderCity: '',
      senderPincode: '',
      senderPhone: '',
    },
  });

  const getBackupData = () => {
      const waybills = localStorage.getItem('ss-cargo-waybills') || '[]';
      const manifests = localStorage.getItem('ss-cargo-manifests') || '[]';
      const inventory = localStorage.getItem('ss-cargo-waybill-inventory') || '[]';
      const allData = {
        waybills: JSON.parse(waybills),
        manifests: JSON.parse(manifests),
        waybillInventory: JSON.parse(inventory),
        exportDate: new Date().toISOString(),
      };
      return JSON.stringify(allData, null, 2);
  }

  const handleSaveToDrive = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
        setIsDriveSaving(true);
        toast({ title: 'Saving to Google Drive...', description: 'Please wait, this may take a moment.' });
        try {
            const fileContent = getBackupData();
            const result = await saveToGoogleDrive(tokenResponse.access_token, fileContent);
            toast({ title: 'Successfully saved to Google Drive', description: `File '${result.name}' was saved.` });
        } catch (error) {
            console.error('Google Drive save error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            toast({ title: 'Failed to save to Google Drive', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsDriveSaving(false);
        }
    },
    onError: (error) => {
        console.error('Google Login error:', error);
        toast({ title: 'Google Login Failed', description: 'Could not authenticate with Google.', variant: 'destructive' });
    },
    scope: 'https://www.googleapis.com/auth/drive.file',
  });


  useEffect(() => {
    const storedTheme = localStorage.getItem('ss-cargo-theme') as Theme | null;
    if (storedTheme) setTheme(storedTheme);

    const storedStickerSize = localStorage.getItem('ss-cargo-stickerSize') as StickerSize | null;
    if (storedStickerSize) setStickerSize(storedStickerSize);

    try {
        const creds = JSON.parse(localStorage.getItem('ss-cargo-credentials') || '{}');
        accountForm.reset({ username: creds.username || 'admin', password: '' });
    } catch { /* ignore */ }

    try {
        const sender = JSON.parse(localStorage.getItem('ss-cargo-defaultSender') || '{}');
        senderForm.reset(sender);
    } catch { /* ignore */ }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('ss-cargo-theme', newTheme);
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

  const handleStickerSizeChange = (newSize: StickerSize) => {
    setStickerSize(newSize);
    localStorage.setItem('ss-cargo-stickerSize', newSize);
    toast({
      title: 'Sticker Size Updated',
      description: `Default print size set to ${newSize}.`,
    });
  };

  const onAccountSubmit = (data: any) => {
    if (updateCredentials(data.username, data.password)) {
        toast({ title: 'Credentials Updated', description: 'Your login details have been changed.'});
        accountForm.reset({ ...data, password: ''});
    } else {
        toast({ title: 'Update Failed', description: 'Please provide both a username and password.', variant: 'destructive' });
    }
  };

  const onSenderSubmit = (data: any) => {
    try {
        localStorage.setItem('ss-cargo-defaultSender', JSON.stringify(data));
        toast({ title: 'Default Sender Saved', description: 'This information will be pre-filled in new waybills.'});
    } catch (error) {
        toast({ title: 'Save Failed', description: 'Could not save default sender information.', variant: 'destructive'});
    }
  };


  const handleClearData = () => {
    try {
      localStorage.removeItem('ss-cargo-waybills');
      localStorage.removeItem('ss-cargo-manifests');
      localStorage.removeItem('ss-cargo-waybill-inventory');
      toast({
        title: 'Application Data Cleared',
        description: 'All waybills, manifests, and inventory have been deleted.',
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast({
        title: 'Error Clearing Data',
        description: 'Could not clear application data from local storage.',
        variant: 'destructive',
      });
    }
  };

  const handleExportData = () => {
    try {
      const allData = getBackupData();
      const blob = new Blob([allData], { type: 'application/json' });
      saveAs(blob, 'ss_cargo_backup.json');
      toast({
        title: 'Data Exported',
        description: 'Your data has been saved to ss_cargo_backup.json.',
      });

    } catch (error) {
       toast({
        title: 'Error Exporting Data',
        description: 'Could not export your data.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and data.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
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
                <div>
                   <Label className="font-medium">Sticker Print Size</Label>
                   <RadioGroup value={stickerSize} onValueChange={(value: StickerSize) => handleStickerSizeChange(value)} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                        <Label htmlFor="size-4x6" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                           <RadioGroupItem value="4x6" id="size-4x6" className="sr-only" />
                           <span className="font-bold text-lg">4" x 6"</span>
                           <span className="text-xs text-muted-foreground">Large</span>
                       </Label>
                       <Label htmlFor="size-3x2" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                           <RadioGroupItem value="3x2" id="size-3x2" className="sr-only" />
                           <span className="font-bold text-lg">3" x 2"</span>
                            <span className="text-xs text-muted-foreground">Medium</span>
                       </Label>
                       <Label htmlFor="size-compact" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                           <RadioGroupItem value="compact" id="size-compact" className="sr-only" />
                           <span className="font-bold text-lg">Compact</span>
                           <span className="text-xs text-muted-foreground">Small</span>
                       </Label>
                       <Label htmlFor="size-75mm" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                           <RadioGroupItem value="75mm" id="size-75mm" className="sr-only" />
                           <span className="font-bold text-lg">75mm</span>
                           <span className="text-xs text-muted-foreground">Square</span>
                       </Label>
                   </RadioGroup>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onAccountSubmit)}>
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>Update your login credentials.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={accountForm.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input {...field} className="pl-10" />
                                        </FormControl>
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={accountForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input type="password" {...field} className="pl-10" placeholder="Enter new password" />
                                        </FormControl>
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="ml-auto">
                            <Save className="mr-2 h-4 w-4" /> Save Credentials
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
      </div>

      <WaybillInventorySettings 
        waybillInventory={waybillInventory}
        addWaybillToInventory={addWaybillToInventory}
        removeWaybillFromInventory={removeWaybillFromInventory}
      />

      <Card>
        <Form {...senderForm}>
            <form onSubmit={senderForm.handleSubmit(onSenderSubmit)}>
                <CardHeader>
                    <CardTitle>Default Sender Information</CardTitle>
                    <CardDescription>This info will be pre-filled when creating new waybills.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                     <FormField
                        control={senderForm.control}
                        name="senderName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sender Name</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={senderForm.control}
                        name="senderPhone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sender Phone</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={senderForm.control}
                        name="senderAddress"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Sender Address</FormLabel>
                                <FormControl><Input placeholder="Enter address" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={senderForm.control}
                        name="senderPincode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sender Pincode</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={senderForm.control}
                        name="senderCity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sender City</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="ml-auto">
                        <Save className="mr-2 h-4 w-4" /> Save Default Sender
                    </Button>
                </CardFooter>
            </form>
        </Form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage application data stored in your browser or cloud.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isGoogleDriveConfigured && (
              <Alert variant="default">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Google Drive Backup Not Configured</AlertTitle>
                  <AlertDescription>
                    To enable Google Drive backups, please add your Google OAuth Client ID to the `.env` file as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
                  </AlertDescription>
              </Alert>
          )}
          <div className="flex items-center justify-between">
            <div>
                <Label className="font-medium">Export All Data</Label>
                <p className="text-sm text-muted-foreground">Save a JSON backup file to your local machine.</p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
                <Label className="font-medium">Save to Google Drive</Label>
                <p className="text-sm text-muted-foreground">Save an encrypted backup to your Google Drive.</p>
            </div>
            <Button variant="outline" onClick={() => handleSaveToDrive()} disabled={isDriveSaving || !isGoogleDriveConfigured}>
              {isDriveSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isDriveSaving ? 'Saving...' : 'Save to Drive'}
            </Button>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
                <Label className="font-medium">Clear All Local Data</Label>
                <p className="text-sm text-muted-foreground">This will permanently delete all waybills, manifests, and inventory.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your waybill, manifest, and inventory data from this device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData}>
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function SettingsPage() {
  const { isInventoryLoaded, waybillInventory, addWaybillToInventory, removeWaybillFromInventory } = useWaybillInventory();

  if (!isInventoryLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return <SettingsPageContent 
    waybillInventory={waybillInventory}
    addWaybillToInventory={addWaybillToInventory}
    removeWaybillFromInventory={removeWaybillFromInventory}
  />;
}
