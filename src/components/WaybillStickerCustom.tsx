
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

  const boxIdBarcode = `${waybill.waybillNumber}${String(boxNumber).padStart(4, '0')}`;

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
      position: 'relative'
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
                <BorderedBox style={{
                    height: '0.8cm',
                    borderRight: '2px solid black',
                    borderBottom: '1px solid black',
                    borderTop: 'none',
                    borderLeft: 'none',
                    padding: '2px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    justifyContent: 'flex-start',
                }}>
                    {waybill.senderName}
                </BorderedBox>

                {/* Waybill No Area */}
                 <BorderedBox style={{
                    height: '0.7cm',
                    borderRight: '2px solid black',
                    borderBottom: '2px solid black',
                    borderTop: 'none',
                    borderLeft: 'none',
                    padding: '2px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    justifyContent: 'flex-start',
                }}>
                    {waybill.waybillNumber}
                </BorderedBox>

                {/* Receiver City */}
                <BorderedBox style={{
                    height: '0.6cm',
                    borderRight: '2px solid black',
                    borderBottom: '2px solid black',
                    borderTop: 'none',
                    borderLeft: 'none',
                    padding: '2px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                }}>
                    {waybill.receiverCity.toUpperCase()}
                </BorderedBox>

                {/* Receiver Name (Delivery Notes) */}
                 <BorderedBox style={{
                    flex: 1,
                    borderRight: '2px solid black',
                    borderTop: 'none',
                    borderBottom: 'none',
                    borderLeft: 'none',
                    padding: '2px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    justifyContent: 'flex-start'
                }}>
                    {waybill.receiverName}
                </BorderedBox>
            </div>

            {/* Right Column */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
            }}>
                {/* Store Code */}
                <BorderedBox style={{ height: '0.7cm', fontSize: '10px', fontWeight: 'bold', borderTop: 'none', borderRight: 'none', borderLeft: 'none' }}>
                    STORE: {storeCode || 'N/A'}
                </BorderedBox>

                {/* Box Number */}
                <BorderedBox style={{ height: '0.7cm', fontSize: '10px', fontWeight: 'bold', borderTop: 'none', borderRight: 'none', borderLeft: 'none' }}>
                    BOX: {boxNumber || 'N/A'} OF {totalBoxes || 'N/A'}
                </BorderedBox>
                
                {/* Truck Illustration */}
                 <BorderedBox style={{
                    height: '1.2cm',
                    padding: '2px',
                    borderTop: 'none', borderRight: 'none', borderLeft: 'none'
                }}>
                   <svg
                      data-ai-hint="truck illustration"
                      width="90%"
                      height="90%"
                      viewBox="0 0 100 60"
                      preserveAspectRatio="xMidYMid meet"
                      xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 45 H 20 V 30 H 45 V 10 H 75 V 45 H 85" fill="none" stroke="black" strokeWidth="3" strokeLinejoin="round" />
                        <rect x="50" y="20" width="20" height="10" fill="none" stroke="black" strokeWidth="3"/>
                        <circle cx="30" cy="45" r="7" fill="none" stroke="black" strokeWidth="3"/>
                        <circle cx="70" cy="45" r="7" fill="none" stroke="black" strokeWidth="3"/>
                    </svg>
                </BorderedBox>

                {/* Main Barcode */}
                <BorderedBox style={{
                    flex: 1,
                    padding: '5px',
                    borderTop: 'none',
                    borderRight: 'none',
                    borderBottom: 'none',
                    borderLeft: 'none'
                }}>
                    <Barcode
                        value={boxIdBarcode}
                        height={40}
                        width={1.2}
                        displayValue={false}
                        margin={0}
                    />
                </BorderedBox>
            </div>
        </div>
    </div>
  );
}
