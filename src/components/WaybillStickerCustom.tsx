
'use client';

import { Waybill } from '@/types/waybill';
import Barcode from 'react-barcode';

interface WaybillStickerCustomProps {
  waybill: Waybill;
  boxNumber?: number;
  totalBoxes?: number;
  storeCode?: string;
}

const BorderedBox = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{
      border: '1px solid black',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
       ...style
    }}>
        {children}
    </div>
);


export function WaybillStickerCustom({ waybill, boxNumber, totalBoxes, storeCode }: WaybillStickerCustomProps) {

  return (
    <div style={{
      width: '9cm',
      height: '7.3cm',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      padding: '2cm 0.5cm 0.5cm 0.5cm',
      boxSizing: 'border-box',
    }}>
        {/* The main content area with border */}
        <div style={{
            width: '100%',
            height: '100%',
            border: '2px solid black',
            display: 'flex',
        }}>
            {/* Left Column */}
            <div style={{
                width: '5.5cm',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
            }}>
                {/* Sender Area */}
                <div style={{
                    height: '0.8cm',
                    borderBottom: '1px solid black',
                    borderRight: '2px solid black',
                    padding: '2px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    {waybill.senderName}
                </div>

                {/* Waybill No Area */}
                <div style={{
                    height: '0.7cm',
                    borderBottom: '2px solid black',
                    borderRight: '2px solid black',
                    padding: '2px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    {waybill.waybillNumber}
                </div>

                {/* Receiver City */}
                <div style={{
                    height: '0.6cm',
                    borderBottom: '2px solid black',
                    borderRight: '2px solid black',
                    padding: '2px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                }}>
                    {waybill.receiverCity.toUpperCase()}
                </div>

                {/* Receiver Name (Delivery Notes) */}
                 <div style={{
                    flex: 1,
                    borderRight: '2px solid black',
                    padding: '2px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                     display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {waybill.receiverName}
                </div>
            </div>

            {/* Right Column */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
            }}>
                {/* Store Code */}
                <BorderedBox style={{ height: '0.7cm', fontSize: '10px', fontWeight: 'bold' }}>
                    STORE: {storeCode || 'N/A'}
                </BorderedBox>

                {/* Box Number */}
                <BorderedBox style={{ height: '0.7cm', fontSize: '10px', fontWeight: 'bold', borderTop: 'none' }}>
                    BOX: {boxNumber || 'N/A'} OF {totalBoxes || 'N/A'}
                </BorderedBox>
                
                {/* Chicken Illustration */}
                <div style={{
                    height: '1.2cm',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                    border: '1px solid black',
                    borderTop: 'none',
                    boxSizing: 'border-box',
                }}>
                   <svg
                      data-ai-hint="chicken illustration"
                      width="90%"
                      height="90%"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="xMidYMid meet"
                      xmlns="http://www.w3.org/2000/svg">
                        <path d="M50,10 C60,0 75,5 85,15 C95,25 90,40 80,50 C85,55 95,60 90,75 C85,90 70,95 60,90 C50,95 40,90 30,75 C25,60 35,55 40,50 C30,40 25,25 35,15 C45,5 50,0 50,10 Z" fill="none" stroke="black" strokeWidth="3"/>
                        <path d="M50,10 C45,20 45,30 50,35 C55,30 55,20 50,10" fill="black"/>
                        <circle cx="65" cy="30" r="3" fill="black"/>
                        <path d="M80,50 C70,60 60,75 50,80 C40,75 30,60 20,50" fill="none" stroke="black" strokeWidth="3"/>
                        <path d="M15,70 L25,85 L10,90 Z" fill="black"/>
                        <path d="M85,70 L75,85 L90,90 Z" fill="black"/>
                    </svg>
                </div>

                {/* Main Barcode */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '5px',
                    border: '1px solid black',
                    borderTop: 'none',
                    boxSizing: 'border-box',
                }}>
                    <Barcode
                        value={waybill.waybillNumber}
                        height={40}
                        width={1.2}
                        displayValue={false}
                        margin={0}
                    />
                </div>
            </div>
        </div>
    </div>
  );
}
