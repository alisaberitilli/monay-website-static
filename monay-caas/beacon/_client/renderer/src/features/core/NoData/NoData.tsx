import React from 'react';
import NoDataExist from '../../../assets/data_not_found.png';
import { Container } from '#client/components/atoms';

interface requiredData {
    name: string;
}

const NoData: React.FC<requiredData> = ({
    name 
}) => {
  return (
    <Container className='flex justify-center'>
        <div className='mx-[20px] my-[50px] flex flex-col justify-center items-center'>
            <p className='mb-[10px] text-[#36597D] text-[18px] font-medium text-center'>
                Your search - <span className='font-semibold'>{name}</span> - did not match any invoices.
            </p>
            <img src={NoDataExist} alt="NoDataExist" className='w-[80%]' />
        </div>
    </Container>
  )
}

export default NoData
