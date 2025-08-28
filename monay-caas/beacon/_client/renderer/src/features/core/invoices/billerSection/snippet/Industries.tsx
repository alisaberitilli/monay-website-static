import { Container } from '#client/components/atoms'

interface IndustriesProps {
    heading?: string,
    details?: any,
}

const Industries: React.FC<IndustriesProps> = ({
    heading,
    details
}) => {
  return (
    <Container
        type = "neu"
        className='w-[700px]'
    >
        <p className='mb-[10px] text-[#36597D] text-[18px] font-[700]'>{heading}</p>
        <div className='flex justify-center flex-wrap' >
            {details.map((detail) => (
                <div key={detail.id} className='w-[150px] h-[100px] flex flex-col justify-center items-center'>
                    <img src={detail.logo} alt="PepcoIcon" />
                    <p className='text-[#36597D] text-[16px] font-[600] cursor-pointer'>{detail.name}</p>
                </div>
            ))}
            <div className='w-[150px] h-[100px] flex flex-col justify-center items-center'>
                <p className='text-[#36597D] text-[15x] font-[600] cursor-pointer'>View More</p>
            </div>    
        </div>
    </Container> 
  )
}

export default Industries