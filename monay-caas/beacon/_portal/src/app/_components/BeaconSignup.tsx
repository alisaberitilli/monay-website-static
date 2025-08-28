import React from 'react';
import {Container, Button} from '../../../../_client/renderer/src/components/atoms';
import { env } from "#portal/env.mjs";

const URL = env.NEXT_PUBLIC_BEACON_URL;

interface BeaconSignupProps {
  proImg?: any;
  proDesc?: string;
}

const BeaconSignup: React.FC<BeaconSignupProps> = ({}) => {
  return (
    <Container
      type='neu'
    >
      <div className='flex pt-[100px] '>
        <p className='flex items-center justify-center w-[50px] h-[50px] rounded-[50%] border-[#F1F5F9]' style={{ padding: '15px', margin: '5px', boxShadow: '-2px -2px 2px 0px #B8CCE0 inset, -1px -1px 0px 0px #FFF inset', filter: 'drop-shadow(-2px -2px 2px #B8CCE0) drop-shadow(-1px -1px 0px #FFF)'}}>AS</p>
        <p className='text-[#8B9EB0] text-[14px] font-normal' style={{margin: '5px 0px 0px 5px'}}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard du</p>
      </div>
      <Button style={{width: '100%', marginTop: '10px'}} onClick={() =>  window.open(URL)}>Sign Up for Beacon</Button>
    </Container>
  )
}

export default BeaconSignup