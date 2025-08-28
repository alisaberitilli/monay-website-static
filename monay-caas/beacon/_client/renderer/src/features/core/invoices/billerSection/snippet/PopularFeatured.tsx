import { Container } from '#client/components/atoms'
import ElectronIcon from '#client/assets/payInvoice/electricIcon.png'
import React from 'react'

interface PopularFeaturedProps {
    billers?: any
}

const PopularFeatured: React.FC<PopularFeaturedProps> = ({
    billers
}) => {
  return (
    <Container
        type="neu"
        className='w-[430px]'
    >
        <p className='text-[#36597D] text-[18px] font-[700]'>Popular featured billers</p>
        {billers.map((biller) => (
            <div key={biller.id} className='mt-[30px]'>
                <div className='flex'>
                    <img src={ElectronIcon} alt="ElectronIcon" className='w-[15px] h-[15px] mt-[5px]' />
                    <p className='text-[#007EFF] text-[16px] font-[600] ml-[5px]'>{biller.service}</p>
                </div>
                {biller.billerList.map((b: string, index: number) =><p key={index} className='ml-[25px] mt-[-7px] leading-[19px] text-[#8B9EB0] text-[14px] font[400]'><br/>{b}</p>)}
            </div>
        ))}

    </Container>
  )
}

export default PopularFeatured
