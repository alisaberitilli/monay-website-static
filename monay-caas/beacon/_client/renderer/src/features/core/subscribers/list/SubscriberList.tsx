import React from 'react'

import { Container } from '#client/components/atoms'
import peopleGas from '#client/assets/payInvoice/Peoplegas.png'
import info from '#client/assets/info.png'
import { TextInput } from '#client/components/form';

interface SubscriberListProps {
    companyId?: number;
    companyLogo?: any;
    companyName?: string;
    joinedDate?: string;
}

const subscriberList: SubscriberListProps[] = [
    {
        companyId: 3245234345,
        companyLogo: {peopleGas},
        companyName: "People Gas",
        joinedDate: "21.01.12",
    },
    {
        companyId: 3245234346,
        companyLogo: {peopleGas},
        companyName: "People Gas",
        joinedDate: "21.01.12",
    },
    {
        companyId: 3245234347,
        companyLogo: {peopleGas},
        companyName: "People Gas",
        joinedDate: "21.01.12",
    },
    {
        companyId: 3245234348,
        companyLogo: {peopleGas},
        companyName: "People Gas",
        joinedDate: "21.01.12",
    }
]

const SubscriberList: React.FC = ({}) => {
  return (
    <Container
        type="neu"
        className=''
    >
        <TextInput base='search' placeholder='Bills / Industries' />
        <p className='text-[#36597D] font-semibold text-[16px] my-[8px]'>Subscriber List</p>
        {subscriberList.map((subscriber) => 
            <Container
                type="neuList"
                className=' flex items-center py-[12px] pr-[13px] my-[8px] pl-0'
            >
                <img src={peopleGas} alt="peopleGas" className='w-[52px] h-[52px]' />
                <div className='pl-[18px] pr-[55px] flex flex-col'>
                    <p className='text-[#36597D] font-bold text-[18px]'>{subscriber.companyName}</p>
                    <p className='text-[#8B9EB0] font-normal text-[12px]'>Id: {subscriber.companyId}</p>
                </div>
                <div className='w-[32px] h-[16px]'></div>
                <div className='pl-[61px] text-[#36597D] font-normal text-[12px] mr-0 ml-auto'>Date Joined : {subscriber.joinedDate}</div>
                <img src={info} alt="info" className='w-[24px] h-[24px] fill-[#F1F5F9] mr-0 ml-auto cursor-pointer' />
            </Container>
        )}
        <div className='flex'><p className='mr-[16px] ml-auto mb-[4px] text-[#564DCD] font-bold text-[12px] cursor-pointer'>View more</p></div>
    </Container>
  )
}

export default SubscriberList

