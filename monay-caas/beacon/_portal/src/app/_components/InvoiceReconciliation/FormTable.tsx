import React from 'react';
import { Container } from '../../../../../_client/renderer/src/components/atoms';

interface FormTableProps {
    tableTitle?: string;
    data: { 
        id?: number; 
        column1?: string; 
        column2?: string; 
        column3?: string 
    }[];
}

const FormTable: React.FC<FormTableProps> = ({ 
    tableTitle = 'Uploaded Data',
    data = Array.from({ length: 9 }, (_, index) => ({
        id: index + 1,
        column1: `Cell text ${index + 1}`,
        column2: `Cell text ${index + 1}`,
        column3: `Cell text ${index + 1}`,
    })), 
}) => {
  return (
    <Container
        type='neu'
    >
    <div className='w-[124px] text-[#36597D] text-[18px] font-semibold'>{tableTitle}</div>
    <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '22px' }}>
        <thead>
            <tr style={{backgroundColor: '#E9ECEF'}}>
                <th className='text-[18px] font-semibold text-[#495057] text-left' style={{padding: '10px 70px 10px 20px'}}>Column 1</th>
                <th className='text-[18px] font-semibold text-[#495057] text-left' style={{padding: '10px 70px 10px 20px'}}>Column 2</th>
                <th className='text-[18px] font-semibold text-[#495057] text-left' style={{padding: '10px 70px 10px 20px'}}>Column 3</th>
            </tr>
        </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={row.id} style={{backgroundColor: index%2 === 1 ? '#F8F9FA' : ''}}>
            <td className='text-[16px] text-[#495057] text-left' style={{padding: '8px 20px'}}>{row.column1}</td>
            <td className='text-[16px] text-[#495057] text-left' style={{padding: '8px 20px'}}>{row.column2}</td>
            <td className='text-[16px] text-[#495057] text-left' style={{padding: '8px 20px'}}>{row.column3}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </Container>
  );
};

export default FormTable
 