import React from 'react'
import PepcoIcon from "#client/assets/payInvoice/PepcoIcon.png";
import { Container } from '#client/components/atoms';

interface BillerMetadataProps {
  id?: number;
  logo?: string;
  name?: string;
  industry?: string;
  location?: string;
  contactNumber?: string;
  contactMail?: string;
  cardLastFourDigit?: any;
}

const BillerMetadata: React.FC<BillerMetadataProps> = ({
  id = 8764323456,
  logo = PepcoIcon,
  name = 'Pepco',
  industry = 'Utilities (Electricity)',
  location = 'Cityville, Stateville, Countryland',
  contactNumber = '1-800-123-4567',
  contactMail = 'info@xyz-electric.com',
  cardLastFourDigit = '0982',
}) => {
  return (
    <Container
      type='neu'
      className='h-[246px]'
    >
      <div className='flex items-center mb-[15px] px-[10px] py-[5px]'>
        <img src={logo} alt="logo" className='mr-[20px]' />
        <p className='text-[#36597D] text-[28px] font-bold mr-[20px]'>{name}</p>
        <p className='text-[#8B9EB0] text-[12px] font-normal'>ID: {id}</p>
      </div>
      <div className='flex px-[20px] py-[5px]'>
        <div className='mr-[20px] text-[#36597D] text-[14px] font-normal'>
          <p className='mb-[7px] h-[21px]'>Industry</p>
          <p className='mb-[7px] h-[21px]'>Location</p>
          <p className='mb-[7px] h-[42px]'>Contact Info</p>
          <p className='h-[21px]'>Credit card</p>
        </div>
        <div className='text-[#8B9EB0] text-[14px] font-normal'>
          <p className='mb-[7px]'>{industry}</p>
          <p className='mb-[7px]'>{location}</p>
          <p className='flex flex-col mb-[7px]'>
            {contactNumber}
            <span>Email: {contactMail}</span>
          </p>
          <p>VISA ***** {cardLastFourDigit}</p>
        </div>
      </div>
    </Container>
  )
}

export default BillerMetadata
