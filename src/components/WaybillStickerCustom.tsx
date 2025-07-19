
'use client';

import { Waybill } from '@/types/waybill';
import Barcode from 'react-barcode';

interface WaybillStickerCustomProps {
  waybill: Waybill;
  boxNumber?: number;
  totalBoxes?: number;
  storeCode?: string;
}

// Helper component for layout sections
const Section = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{...style}}>{children}</div>
);

const BorderedBox = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ border: '1px solid black', padding: '2px', textAlign: 'center', ...style }}>{children}</div>
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
      padding: '0 0.5cm 0.5cm 0.5cm',
      boxSizing: 'border-box',
    }}>
        {/* Top 2cm free space */}
        <div style={{ height: '2cm', width: '100%' }}></div>
        
        {/* Main content area */}
        <div style={{
            flex: 1,
            border: '2px solid black',
            display: 'flex',
        }}>
            {/* Left Column */}
            <div style={{ 
                width: '5.5cm',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '2px solid black',
            }}>
                {/* Sender Area */}
                <Section style={{ 
                    height: '0.8cm', 
                    borderBottom: '1px solid black',
                    padding: '2px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    FROM: {waybill.senderName}
                </Section>
                
                {/* Waybill No Area */}
                <Section style={{ 
                    height: '0.8cm',
                    borderBottom: '2px solid black',
                    padding: '2px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    WAYBILL NO: {waybill.waybillNumber}
                </Section>
                
                {/* Receiver City */}
                <Section style={{
                    height: '1.2cm',
                    borderBottom: '2px solid black',
                    padding: '2px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                }}>
                    {waybill.receiverCity.toUpperCase()}
                </Section>
                
                {/* Receiver Name */}
                 <Section style={{
                    height: '0.6cm',
                    padding: '2px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    TO: {waybill.receiverName}
                </Section>
                 {/* Box ID Barcode */}
                <Section style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                }}>
                    {boxNumber && totalBoxes && (
                       <Barcode
                            value={`BOX${boxNumber}OF${totalBoxes}`}
                            height={25}
                            width={1.5}
                            displayValue={true}
                            fontSize={10}
                            margin={0}
                        />
                    )}
                </Section>

            </div>

            {/* Right Column */}
            <div style={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                
            }}>
                {/* Store Code */}
                <BorderedBox style={{ height: '0.8cm', fontSize: '10px', fontWeight: 'bold' }}>
                    STORE: {storeCode || 'N/A'}
                </BorderedBox>
                
                {/* Box Number */}
                <BorderedBox style={{ height: '0.8cm', fontSize: '10px', fontWeight: 'bold', borderTop: 'none' }}>
                    BOX: {boxNumber || 'N/A'} OF {totalBoxes || 'N/A'}
                </BorderedBox>
                
                {/* Main Barcode */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '5px'
                }}>
                    <Barcode
                        value={waybill.waybillNumber}
                        height={50}
                        width={2}
                        displayValue={false}
                    />
                </div>
            </div>
        </div>
    </div>
  );
}

    