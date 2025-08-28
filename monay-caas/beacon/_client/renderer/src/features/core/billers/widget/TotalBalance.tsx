import { Button, Container } from '#client/components/atoms'

interface TotalBalanceProps {
    balance?: number;
}

const TotalBalance: React.FC<TotalBalanceProps> = ({
    balance = 132.00
}) => {
  return (
    <Container
        type='neu'
        style={{padding: "20px 40px 30px 40px"}}
        className='flex justify-between items-center '
    >
        <div className=''>
            <p className='text-[16px] text-[#36597D] font-normal'>Total balance</p>
            <p className='text-[32px] text-[#36597D] font-bold'>${balance}</p>
        </div>
        <Button className='w-[70px] h-[40px]'>Pay</Button>
    </Container>
  )
}

export default TotalBalance
