import { Container } from '#client/components/atoms'
import React from 'react'

interface BillerAccountsProps {

}

const BillerAccounts:React.FC<BillerAccountsProps> = ({}) => {
  return (
    <Container
      type="neu"
    >
      <p className='text-[#36597D] text-[18px] font-semibold mb-[20px]'>Accounts / Services / Contracts</p>
      <div className='px-[10px] py-[5px] mb-[10px]'>
        <p className='font-semibold text-[#36597D] text-[16px]'>Account 01 #</p>
        <p className='font-medium text-[#8B9EB0] text-[14px]'>Gas</p>
      </div>
      <div className='px-[10px] py-[5px] mb-[10px]'>
        <p className='font-semibold text-[#36597D] text-[16px]'>Electricity Account #</p>
        <p className='font-semibold text-[#36597D] text-[16px]'>Electricity</p>
      </div>
      <div className='px-[10px] py-[5px] mb-[10px]'>
        <p className='font-semibold text-[#36597D] text-[16px]'>Water Account #</p>
        <p className='font-medium text-[#8B9EB0] text-[14px]'>Water</p>
      </div>
    </Container>
  )
}

export default BillerAccounts
