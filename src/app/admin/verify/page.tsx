
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, KeyRound, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminVerifyPage() {
  const router = useRouter();
  const { verifyAdminPin } = useAuth();
  const { toast } = useToast();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleVerify = () => {
    setError(null);
    if (verifyAdminPin(pin)) {
      toast({ title: 'Access Granted', description: 'Welcome, Admin!' });
      router.replace('/admin');
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-bold">Admin Verification</CardTitle>
          <CardDescription>Please enter the secret PIN to access the admin panel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Enter Admin PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className="pl-10 text-center tracking-widest text-lg"
              maxLength={4}
            />
          </div>
           {error && (
              <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleVerify} className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Verify & Enter
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
