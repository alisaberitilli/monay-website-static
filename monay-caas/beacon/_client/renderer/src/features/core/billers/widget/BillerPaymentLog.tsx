import { Container } from '#client/components/atoms';

interface BillerPaymentLogProps {
  date?: any;
  invoiceId: number;
  paymentType: any;
  status: string;
  amount: number;
}

const BillerPaymentLogData: BillerPaymentLogProps[] =[
  {
    date: 'June 14, 2023',
    invoiceId: 1230023000220635,
    paymentType: 'Visa ****6543',
    status: 'Completed',
    amount: 126.21,
  },
  {
    date: 'June 14, 2023',
    invoiceId: 1230023000220635,
    paymentType: 'RTGS',
    status: 'Failed',
    amount: 126.21,
  },
  {
    date: 'June 14, 2023',
    invoiceId: 1230023000220635,
    paymentType: 'Visa ****6543',
    status: 'Pending',
    amount: 126.21,
  },
  {
    date: 'June 14, 2023',
    invoiceId: 1230023000220635,
    paymentType: 'Visa ****6543',
    status: 'Completed',
    amount: 126.21,
  },
  {
    date: 'June 14, 2023',
    invoiceId: 1230023000220635,
    paymentType: 'UPI',
    status: 'Completed',
    amount: 126.21,
  },
]

const BillerPaymentLog = ({}) => {
  // TODO: check incoming biller payment logs, if >6 slice, set "see more" var
  return (
    <Container 
      type="neu"
      className='px-[40px] pb-[30px]'
    >
      <p className='font-semibold text-[#36597D] text-[18px] mb-[20px]'>Payment logs</p>
      <table className="w-[100%]">
        <tr className='text-left font-semibold text-[#36597D] text-[14px]'>
          <th className="w-[12%] pb-[20px]">Date</th>
          <th className="w-[15%] pb-[20px]">Invoice ID</th>
          <th className="w-[12%] pb-[20px]">Payment type</th>
          <th className="w-[9%] pb-[20px]">Status</th>
          <th className="w-[10%] pb-[20px]">Amount</th>
        </tr>
        {BillerPaymentLogData.map((paymentLog, index) => (
          <tr
            key = {index}
            className="text-[14px] font-normal leading-5 text-[#36597D]"
          >
            <td className="min-w-[12%] pb-[20px] text-[#8B9EB0] text-[14px] ">{paymentLog.date}</td>
            <td className="min-w-[15%] pb-[20px] text-[#564DCD] text-[14px]">{paymentLog.invoiceId}</td>
            <td className="min-w-[12%] pb-[20px] text-[#8B9EB0] text-[14px] ">{paymentLog.paymentType}</td>
            <td className="min-w-[9%] pb-[20px]">
              <p 
                className='flex justify-center items-center rounded-[5px] w-[80px] h-[20px]'
                style={
                  paymentLog.status === "Completed" ? {
                    background: "var(--green-100, #DCFCE7)", color: "var(--green-600, #16A34A)"
                  } : paymentLog.status === "Failed" ? {
                      background: "var(--red-100, #FEE2E2)", color: "var(--red-600, #DC2626)"
                    } : {
                      background: "var(--amber-100, #FEF3C7)", color: "var(--amber-600, #D97706)"
                    }
                }>{paymentLog.status}</p>
            </td>
            <td className="min-w-[10%] pb-[20px] text-[#36597D] text-[14px]">${paymentLog.amount}</td>
          </tr>
        ))}
      </table>
      <div className='flex justify-end h-[15px]'>
        <p className='text-[#36597D] text-[12px] font-medium cursor-pointer'>View more</p>
      </div>
    </Container>
  )
}

export default BillerPaymentLog
