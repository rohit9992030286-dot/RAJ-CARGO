
'use client';

import { useState } from 'react';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Waybill } from '@/types/waybill';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Search, Printer, AlertCircle } from 'lucide-react';

export default function PrintStickerPage() {
  const { waybills, isLoaded } = useWaybills();
  const [waybillNumber, setWaybillNumber] = useState('');
  const [foundWaybill, setFoundWaybill] = useState<Waybill | null>(null);
  const [storeCode, setStoreCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    setError(null);
    setFoundWaybill(null);
    if (!waybillNumber) {
      setError('Please enter a waybill number.');
      return;
    }
    const waybill = waybills.find(w => w.waybillNumber === waybillNumber);
    if (waybill) {
      setFoundWaybill(waybill);
    } else {
      setError('Waybill not found. Please check the number and try again.');
    }
  };

  const handlePrintSticker = () => {
    if (!foundWaybill) return;

    const totalBoxes = foundWaybill.numberOfBoxes || 1;
    for (let i = 1; i <= totalBoxes; i++) {
      const url = `/print/sticker/${foundWaybill.id}?storeCode=${encodeURIComponent(storeCode)}&boxNumber=${i}&totalBoxes=${totalBoxes}`;
      window.open(url, '_blank');
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Print Waybill Sticker</h1>
      <Card>
        <CardHeader>
          <CardTitle>Find Waybill</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              id="waybill-number"
              placeholder="Enter Waybill Number (e.g., SW-123456)"
              value={waybillNumber}
              onChange={(e) => setWaybillNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-grow"
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
          {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        {foundWaybill && (
          <>
            <CardContent>
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Waybill Found!</AlertTitle>
                    <AlertDescription>
                        <p><strong>To:</strong> {foundWaybill.receiverName}</p>
                        <p><strong>Address:</strong> {foundWaybill.receiverAddress}</p>
                        <p><strong>Number of Boxes:</strong> {foundWaybill.numberOfBoxes}</p>
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="store-code">Store Code (Optional)</Label>
                <Input
                  id="store-code"
                  placeholder="Enter store code"
                  value={storeCode}
                  onChange={(e) => setStoreCode(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handlePrintSticker} className="w-full">
                <Printer className="mr-2 h-4 w-4" />
                Print {foundWaybill.numberOfBoxes} {foundWaybill.numberOfBoxes > 1 ? 'Stickers' : 'Sticker'}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
