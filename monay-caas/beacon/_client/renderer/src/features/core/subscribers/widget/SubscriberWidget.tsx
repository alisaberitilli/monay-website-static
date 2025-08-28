import React from 'react'

import { Button, Container } from '#client/components/atoms'
import peopleGas from '#client/assets/payInvoice/Peoplegas.png'
import industryIcon from '#client/assets/payInvoice/WasingtonGas.png'

interface SubscriberWidgetProps {
  companyName: string;
  joinedDate: string;
  description: string;
  industries?: string[];
}

const SubscriberWidget:React.FC<SubscriberWidgetProps> = ({
  companyName,
  joinedDate,
  description,
  industries = [],
}) => {
  return (
    <Container
      type='neu'
    >
      <div className='flex items-center mb-[20px]'>
        <div className='w-[108px] h-[101px] flex justify-center items-center border border-gray-400 rounded-[10px] mr-[14px]'>
          <img src={peopleGas} alt="peopleGas" className='w-[80px] h-[80px]' />
        </div>
        <div>
          <p className='text-[#36597D] text-[18px] font-bold pb-[8px]'>{companyName}</p>
          <p className='text-[#36597D] text-[12px] font-normal pb-[12px]'>Date Joined : {joinedDate}</p>
          <div className='flex'>
            <p className='text-[#8B9EB0] text-[14px] font-semibold mr-[16px]'>Industries </p>
            {industries.map(industry => <img src={industryIcon} alt='industryIcon' className='w-[20px] h-[20px] mr-[6px]' />)}
          </div>
        </div>
        <Button className='mr-0 ml-auto'>Add Subscriber</Button>
      </div>
      <div className='text-[#8B9EB0] text-[14px] font-normal'>
        {description}
      </div>
    </Container>
  )
}

export default SubscriberWidget
