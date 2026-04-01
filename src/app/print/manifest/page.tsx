
'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { useManifests } from '@/hooks/useManifests';
import { Waybill } from '@/types/waybill';
import { Manifest } from '@/types/manifest';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { DataProvider } from '@/components/DataContext';
import Barcode from 'react-barcode';

const chunkArray = (array: any[], size: number) => {
  const chunked_arr = [];
  for (let i = 0; i < array.length; i += size) {
    chunked_arr.push(array.slice(i, i + size));
  }
  return chunked_arr;
};


function ManifestPrint({ waybills, manifest }: { waybills: Waybill[], manifest: Manifest }) {
    const totalBoxes = waybills.reduce((total, wb) => total + wb.numberOfBoxes, 0);
    const totalWeight = waybills.reduce((total, wb) => total + wb.packageWeight, 0);
    const waybillChunks = chunkArray(waybills, 50);

    return (
        <div className="bg-white text-black font-sans mx-auto print:shadow-none print:p-0">
            {waybillChunks.map((chunk, pageIndex) => (
                <div key={pageIndex} className="p-4 print:p-0 print:page-break-after-always last:print:page-break-after-auto">
                    <header className="flex justify-between items-start pb-4 border-b-2 border-black">
                        <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12">
                                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M 10,80 L 50,80 M 5,100 L 45,100" stroke="black" strokeWidth="10" strokeLinecap="round" />
                                    <path d="M 60,60 Q 110,180 160,60 L 145,50 Q 110,140 75,50 Z" fill="black" />
                                    <path d="M 110,20 L 120,45 L 145,45 L 125,60 L 135,85 L 110,70 L 85,85 L 95,60 L 75,45 L 100,45 Z" fill="black" />
                                    <path d="M 95,160 L 125,160 L 140,185 L 80,185 Z" fill="black" />
                                    <rect x="105" y="140" width="10" height="25" fill="black" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-black uppercase">YU-WON LOGISTICS</h1>
                                <p className="text-black text-sm">DELHI NAJAFGARH. PINCODE 110048</p>
                                <p className="text-black text-sm">EMAIL: contact@yuwonlogistics.com</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold uppercase tracking-wider text-black">Manifest</h2>
                            <div className="flex justify-end">
                                <Barcode 
                                    value={manifest.manifestNo}
                                    height={35}
                                    width={1.2}
                                    fontSize={12}
                                />
                            </div>
                            <p className="text-sm font-semibold text-black mt-1">Date: {new Date(manifest.date).toLocaleDateString()}</p>
                            <p className="text-sm font-semibold text-black">Vehicle No: {manifest.vehicleNo}</p>
                            <p className="text-sm font-semibold text-black">Page: {pageIndex + 1} of {waybillChunks.length}</p>
                        </div>
                    </header>
                    <main className="mt-4">
                        <table className="w-full text-sm border-collapse border-2 border-black">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border-2 border-black p-1">S.No.</th>
                                    <th className="border-2 border-black p-1">Waybill No</th>
                                    <th className="border-2 border-black p-1">Destination</th>
                                    <th className="border-2 border-black p-1">No. of Boxes</th>
                                    <th className="border-2 border-black p-1">Weight (kg)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chunk.map((wb, index) => (
                                    <tr key={wb.id}>
                                        <td className="border-2 border-black p-1 text-center">{pageIndex * 50 + index + 1}</td>
                                        <td className="border-2 border-black p-1">{wb.waybillNumber}</td>
                                        <td className="border-2 border-black p-1">{wb.receiverCity}, {wb.receiverPincode}</td>
                                        <td className="border-2 border-black p-1 text-center">{wb.numberOfBoxes}</td>
                                        <td className="border-2 border-black p-1 text-right">{wb.packageWeight.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {pageIndex === waybillChunks.length - 1 && (
                                <tfoot>
                                    <tr className="font-bold bg-gray-200">
                                        <td colSpan={3} className="border-2 border-black p-1 text-right">Total</td>
                                        <td className="border-2 border-black p-1 text-center">{totalBoxes}</td>
                                        <td className="border-2 border-black p-1 text-right">{totalWeight.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </main>
                    {pageIndex === waybillChunks.length - 1 && (
                        <footer className="mt-8 grid grid-cols-2 gap-8 text-sm">
                            <div>
                                <p className="font-bold mb-2">Driver's Signature:</p>
                                <div className="h-12 border-b border-gray-400"></div>
                                <p>{manifest.driverName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="font-bold mb-2">Hub Incharge Signature:</p>
                                <div className="h-12 border-b border-gray-400"></div>
                            </div>
                        </footer>
                    )}
                </div>
            ))}
        </div>
    )
}


function PrintManifestContent() {
  const searchParams = useSearchParams();
  const { getWaybillById, isLoaded: waybillsLoaded } = useWaybills();
  const { getManifestById, isLoaded: manifestsLoaded } = useManifests();

  const [waybillsToPrint, setWaybillsToPrint] = useState<Waybill[]>([]);
  const [manifestData, setManifestData] = useState<Manifest | null>(null);

  const printTriggered = useRef(false);

  useEffect(() => {
    if (waybillsLoaded && manifestsLoaded) {
      const manifestId = searchParams.get('id');

      if (manifestId) {
        const manifest = getManifestById(manifestId);
        if (manifest) {
          setManifestData(manifest);
          const manifestWaybills = manifest.waybillIds.map(id => getWaybillById(id)).filter((w): w is Waybill => !!w);
          setWaybillsToPrint(manifestWaybills);
        }
      }
    }
  }, [waybillsLoaded, manifestsLoaded, searchParams, getWaybillById, getManifestById]);

  useEffect(() => {
    if (waybillsToPrint.length > 0 && !printTriggered.current) {
      printTriggered.current = true;
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [waybillsToPrint]);

  if (!waybillsLoaded || !manifestsLoaded || !manifestData) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="bg-white">
      <ManifestPrint waybills={waybillsToPrint} manifest={manifestData} />
    </div>
  );
}

function PrintManifestPageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen bg-white"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <PrintManifestContent />
        </Suspense>
    )
}

export default function PrintManifestPage() {
    return (
      <DataProvider>
        <PrintManifestPageWrapper />
      </DataProvider>
    )
}
