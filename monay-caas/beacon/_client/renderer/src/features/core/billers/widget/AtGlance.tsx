import { Container } from '#client/components/atoms'
import React from 'react'

interface AtGlanceProps {
    lastInvoice?: number;
    date?: string;
    amount?: number;
    dueDate?: string;
}

const AtGlance: React.FC<AtGlanceProps> = ({
    lastInvoice = 1230023000220635,
    date = "Sep 02, 2023",
    amount = 321.00,
    dueDate = "Sep 24"
}) => {

  return (
    <Container
        type='neu'
        style={{padding: "20px 40px 30px 40px"}}
        className='flex justify-between items-center '
    >
        <div className=''>
            <p className='text-[16px] text-[#36597D] font-normal'>Last Invoice</p>
            <p className='text-[16px] text-[#36597D] font-semibold'>{lastInvoice}</p>
        </div>

        <div className=''>
            <p className='text-[14px] text-[#36597D] font-normal'>Date</p>
            <p className='text-[16px] text-[#36597D] font-semibold'>{date}</p>
        </div>

        <div className=''>
            <p className='text-[14px] text-[#36597D] font-normal'>Amount</p>
            <p className='text-[16px] text-[#36597D] font-semibold'>${amount}</p>
        </div>

        <div className='flex justify-center items-center px-[5px] py-[2px] rounded-[6px] bg-gradient-to-r from-blue-100 via-blue-200 to-transparent'>
            <p className='text-[16px] text-[#564DCD] font-semibold'>Due: {dueDate}</p>
        </div>
    </Container>
  )
}

export default AtGlance

