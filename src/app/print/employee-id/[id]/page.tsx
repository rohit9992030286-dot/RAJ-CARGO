
'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Building, Phone, Mail, User, Star, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

const STORAGE_KEY = 'rajcargo-employees';

type Employee = {
    id: string;
    employeeCode: string;
    name: string;
    post: string;
    dateOfJoining: string;
    mobileNo: string;
    photoUrl?: string;
};

function EmployeeIdCard({ employee }: { employee: Employee }) {
    return (
        <div className="bg-white text-black font-sans" style={{ width: '8.5cm', height: '5.4cm', margin: 0, padding: 0 }}>
            <div className="relative w-full h-full flex flex-col shadow-lg border-2 border-gray-200">
                {/* Header */}
                <div className="bg-primary text-white p-2 flex items-center justify-between">
                    <h1 className="text-lg font-bold tracking-wider">RAJ CARGO</h1>
                    <Star className="h-6 w-6 text-yellow-300" />
                </div>
                
                {/* Background waterkmark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                     <svg width="150" height="150" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 30,100 Q 100,20 180,80 L 130,140 Q 80,110 30,100 Z" fill="hsl(var(--primary))" />
                    </svg>
                </div>


                {/* Body */}
                <div className="flex-grow p-2 flex items-center gap-3 relative">
                    {/* Photo */}
                    <div className="w-24 h-28 border-2 border-primary flex-shrink-0 relative">
                         <Image
                            src={employee.photoUrl || 'https://placehold.co/96x112.png'}
                            alt={`${employee.name}'s photo`}
                            layout="fill"
                            objectFit="cover"
                         />
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-1 text-xs">
                        <p className="font-bold text-lg text-primary">{employee.name}</p>
                        <p className="font-medium text-gray-600">{employee.post}</p>
                        <hr className="my-1"/>
                        <p className="flex items-center gap-1.5"><User className="h-3 w-3" /> <span className="font-semibold">ID:</span> {employee.employeeCode}</p>
                        <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> <span className="font-semibold">Mob:</span> {employee.mobileNo}</p>
                        <p className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> <span className="font-semibold">DOJ:</span> {format(new Date(employee.dateOfJoining), 'dd/MM/yyyy')}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-3 pb-2 flex justify-end">
                    <div className="w-32 text-center">
                        <div className="h-8"></div>
                        <p className="border-t border-gray-400 text-xs font-semibold pt-0.5">Authorised Signatory</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


function PrintIdPage() {
    const params = useParams();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const printTriggered = useRef(false);

    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    useEffect(() => {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (storedData) {
                const employees = JSON.parse(storedData);
                const emp = employees.find((e: Employee) => e.id === id);
                if (emp) {
                    setEmployee(emp);
                }
            }
        } catch(e) { console.error(e) }
    }, [id]);

    useEffect(() => {
        if (employee && !printTriggered.current) {
            printTriggered.current = true;
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [employee]);

     const printStyles = `
        @media print {
            @page {
                size: 8.5cm 5.4cm;
                margin: 0;
            }
            body {
                -webkit-print-color-adjust: exact;
            }
        }
    `;

    if (!employee) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="ml-4">Loading Employee Data...</p>
            </div>
        );
    }
    
    return (
        <>
        <style>{printStyles}</style>
        <div className="flex justify-center items-center h-screen bg-gray-300">
             <EmployeeIdCard employee={employee} />
        </div>
        </>
    )
}

export default function PrintIdPageWrapper() {
    return (
        <Suspense fallback={
             <div className="flex justify-center items-center h-screen bg-white">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        }>
            <PrintIdPage />
        </Suspense>
    )
}
