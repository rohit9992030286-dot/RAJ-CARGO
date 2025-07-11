'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Waybill } from '@/types/waybill';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillList } from '@/components/WaybillList';
import { WaybillForm } from '@/components/WaybillForm';
import { Truck, PlusCircle } from 'lucide-react';

type ViewState = { view: 'list' } | { view: 'create' } | { view: 'edit'; id: string };

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>({ view: 'list' });
  const { waybills, addWaybill, updateWaybill, deleteWaybill, getWaybillById, isLoaded } = useWaybills();

  const handleCreateNew = () => {
    setViewState({ view: 'create' });
  };

  const handleEdit = (id: string) => {
    setViewState({ view: 'edit', id });
  };

  const handleCancel = () => {
    setViewState({ view: 'list' });
  };

  const handleSave = (waybill: Waybill) => {
    if (viewState.view === 'create') {
      addWaybill(waybill);
    } else if (viewState.view === 'edit') {
      updateWaybill(waybill);
    }
    setViewState({ view: 'list' });
  };

  const handleDelete = (id: string) => {
    deleteWaybill(id);
    setViewState({ view: 'list' });
  };

  const renderContent = () => {
    if (!isLoaded) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (viewState.view) {
      case 'create':
        return <WaybillForm onSave={handleSave} onCancel={handleCancel} />;
      case 'edit':
        const waybillToEdit = getWaybillById(viewState.id);
        if (waybillToEdit) {
          return <WaybillForm initialData={waybillToEdit} onSave={handleSave} onCancel={handleCancel} />;
        }
        // Fallback if waybill not found
        setViewState({ view: 'list' });
        return null;
      case 'list':
      default:
        return <WaybillList waybills={waybills} onEdit={handleEdit} onDelete={handleDelete} onCreateNew={handleCreateNew} />;
    }
  };

  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline text-gray-800">SwiftWay</h1>
        </div>
        {viewState.view === 'list' && (
          <Button onClick={handleCreateNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Waybill
          </Button>
        )}
      </header>
      <main>
        {renderContent()}
      </main>
      <footer className="text-center mt-12 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} SwiftWay. All rights reserved.</p>
      </footer>
    </div>
  );
}
