
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, ScanLine } from 'lucide-react';

export default function HubPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Hub Operations</h1>
        <p className="text-muted-foreground">Manage incoming and outgoing packages at your central hub.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Package Sorting & Scanning</CardTitle>
          <CardDescription>This section will contain tools for managing hub activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <div className="flex items-center gap-4 text-muted-foreground">
                <Cpu className="h-12 w-12" />
                <ScanLine className="h-12 w-12" />
              </div>
              <p className="mt-4 text-lg font-semibold">Hub Features Coming Soon</p>
              <p className="text-sm text-muted-foreground">Functionality for scanning, sorting, and bagging will be built here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
