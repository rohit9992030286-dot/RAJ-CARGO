
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, Pencil, Car, User, Map as MapIcon, IndianRupee, Save, XCircle, Download } from 'lucide-react';
import { Vehicle, vehicleSchema } from '@/types/vehicle';
import { useVehicles } from '@/hooks/useVehicles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useManifests } from '@/hooks/useManifests';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

type VehicleFormData = Omit<Vehicle, 'id'>;

export default function VehicleManagementPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, isLoaded } = useVehicles();
  const { allManifests, isLoaded: manifestsLoaded } = useManifests();
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();

  const formSchemaWithoutId = vehicleSchema.omit({ id: true });

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(formSchemaWithoutId),
    defaultValues: {
      vehicleNumber: '',
      driverName: '',
      route: '',
      routePrice: 0,
      vehicleType: 'Market',
    },
  });

  const onSubmit = (data: VehicleFormData) => {
    if (editingVehicle) {
      const success = updateVehicle({ ...data, id: editingVehicle.id });
      if (success) {
        setEditingVehicle(null);
        form.reset({ vehicleNumber: '', driverName: '', route: '', routePrice: 0, vehicleType: 'Market' });
      }
    } else {
      const success = addVehicle(data);
      if (success) {
        form.reset({ vehicleNumber: '', driverName: '', route: '', routePrice: 0, vehicleType: 'Market' });
      }
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.reset(vehicle);
  };

  const handleCancelEdit = () => {
    setEditingVehicle(null);
    form.reset({ vehicleNumber: '', driverName: '', route: '', routePrice: 0, vehicleType: 'Market' });
  };
  
  const vehicleLastDispatch = useMemo(() => {
    if (!manifestsLoaded) return new Map();
    const dispatchMap = new Map<string, { manifestNo: string, date: string }>();

    allManifests
        .filter(m => m.origin === 'hub' && m.vehicleNo)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .forEach(m => {
            if (!dispatchMap.has(m.vehicleNo!)) {
                dispatchMap.set(m.vehicleNo!, { manifestNo: m.manifestNo, date: m.date });
            }
        });
    return dispatchMap;
  }, [allManifests, manifestsLoaded]);

  const handleExport = () => {
    const dataToExport = vehicles.map(v => ({
      'Vehicle Number': v.vehicleNumber,
      'Driver Name': v.driverName,
      'Route': v.route,
      'Route Price': v.routePrice,
      'Vehicle Type': v.vehicleType,
      'Last Dispatch Date': vehicleLastDispatch.get(v.vehicleNumber) ? format(new Date(vehicleLastDispatch.get(v.vehicleNumber)!.date), 'PP') : 'N/A',
      'Last Manifest No': vehicleLastDispatch.get(v.vehicleNumber)?.manifestNo || 'N/A',
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vehicles");
    XLSX.writeFile(wb, "rajcargo_vehicles.xlsx");
    toast({ title: "Vehicles Exported" });
  };

  if (!isLoaded || !manifestsLoaded) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Vehicle Management</h1>
        <p className="text-muted-foreground">Manage your fleet, drivers, and route details for dispatch.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <Card className="md:col-span-1 sticky top-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>{editingVehicle ? 'Update Vehicle' : 'Add New Vehicle'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField
                  control={form.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Number</FormLabel>
                      <FormControl><Input placeholder="e.g., MH12AB1234" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="driverName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver Name</FormLabel>
                      <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="route" render={({ field }) => (<FormItem><FormLabel>Route Description</FormLabel><FormControl><Input placeholder="e.g., Hub A to Hub B" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="routePrice" render={({ field }) => (<FormItem><FormLabel>Route Price (₹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="vehicleType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                       <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         <SelectItem value="Market">Market</SelectItem>
                         <SelectItem value="Personal">Personal</SelectItem>
                       </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                  )} />
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full">
                  {editingVehicle ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
                </Button>
                {editingVehicle && (
                  <Button variant="ghost" onClick={handleCancelEdit} className="w-full">
                    <XCircle className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Vehicle List</CardTitle>
                    <CardDescription>A list of all registered vehicles and their last dispatch.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={vehicles.length === 0}>
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle #</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Last Dispatch</TableHead>
                  <TableHead>Last Manifest</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.length > 0 ? vehicles.map((v) => {
                  const lastDispatch = vehicleLastDispatch.get(v.vehicleNumber);
                  return (
                    <TableRow key={v.id}>
                        <TableCell className="font-mono">{v.vehicleNumber}</TableCell>
                        <TableCell className="font-medium">{v.driverName}</TableCell>
                        <TableCell>{lastDispatch ? format(new Date(lastDispatch.date), 'PP') : 'N/A'}</TableCell>
                        <TableCell>{lastDispatch ? <Badge variant="secondary">{lastDispatch.manifestNo}</Badge> : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(v)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteVehicle(v.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                         <div className="text-center py-8">
                            <Car className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Vehicles Found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Add a vehicle using the form to get started.</p>
                        </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
