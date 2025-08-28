import { Container } from '#client/components/atoms';
import React from 'react'

interface AuditLogProps {
  propic?: SvgComponent | React.ReactNode;
  name?: string;
  assignedTo?: string;
  date?: any;
}

const AuditLog: AuditLogProps[] =[
  {
    propic: '',
    name: 'Ibrahim Ali',
    assignedTo: 'PEPCO',
    date: '2hrs ago'
  },
  {
    propic: '',
    name: 'Arvind',
    assignedTo: 'Washington Gas',
    date: '20 Sep 2023 at 15:02 IST'
  },
  {
    propic: '',
    name: 'Prakash K',
    assignedTo: 'Howard County',
    date: '18 Sep 2023 03:04 IST'
  },
  {
    propic: '',
    name: 'Xxxxx Xxxxxx',
    assignedTo: 'PEPCO',
    date: '15 Sep 2023 03:04 IST'
  },
  {
    propic: '',
    name: 'Xxxxxxxxx Xxxxxx',
    assignedTo: 'Washington Gas',
    date: '10 Sep 2023 at 15:02 IST'
  },
  {
    propic: '',
    name: 'Xxxxxx Xx',
    assignedTo: 'Howard County',
    date: '02 Sep 2023 03:04 IST'
  },
]

const BillerAuditLog = () => {
  return (
    <Container
      type='neu'
    >
      <div className='flex justify-between items-center'>
        <p className='py-[5px] mr-[10px] w-[] text-[#36597D] text-[18px] font-semibold'>Audit Log</p>
      </div>

      {AuditLog.map((audit, index) => (
        <div key = {index} className='flex mt-[20px] items-center  py-[5px] px-[10px]'>
          <img src='' alt='' className='w-[38px] h-[37px] mr-[10px]' />
          <div>
            <p className='text-[#36597D] text-[14px] font-medium'><span className='font-semibold'>{audit.name}</span> <span className='text-[#8B9EB0]'>Assigned to</span> <span className='font-semibold'>{audit.assignedTo}</span></p>
            <p className='text-[#6E8AA6] text-[12px] font-normal'>{audit.date}</p>
          </div>
        </div>
      ))}
    </Container>
  )
}

export default BillerAuditLog

