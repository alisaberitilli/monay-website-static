import { Container } from "#client/components/atoms";
import ArrowClockWise from "#client/assets/payInvoice/BsArrowClockwise.png";

interface BillerInvoiceListProps {
  invoiceId: number;
  customerName: string;
  date?: any;
  dueDate?: any;
  amount: number;
}

const BillerInvoiceListData: BillerInvoiceListProps[] =[
  {
    invoiceId: 1230023000220635,
    customerName: 'John Smith',
    date: 'June 14, 2023',
    dueDate: 'July 14, 2023',
    amount: 126.21,
  },
  {
    invoiceId: 1230023000220635,
    customerName: 'John Smith',
    date: 'June 14, 2023',
    dueDate: 'July 14, 2023',
    amount: 126.21,
  },
  {
    invoiceId: 1230023000220635,
    customerName: 'John Smith',
    date: 'June 14, 2023',
    dueDate: 'July 14, 2023',
    amount: 126.21,
  },
  {
    invoiceId: 1230023000220635,
    customerName: 'John Smith',
    date: 'June 14, 2023',
    dueDate: 'July 14, 2023',
    amount: 126.21,
  },
  {
    invoiceId: 1230023000220635,
    customerName: 'John Smith',
    date: 'June 14, 2023',
    dueDate: 'July 14, 2023',
    amount: 126.21,
  },
]

const BillerInvoiceList = ({}) => {
  return (
    <Container 
      type="neu"
      className='px-[40px] pb-[30px]'
    >
      <div className="flex justify-between items-center">
        <p className='font-semibold text-[#36597D] text-[18px] mb-[20px]'>Invoices</p>
        <div className="flex justify-center items-center px-[10px] py-[5px] rounded-[5px] w-[91px] h-[28px] cursor-pointer" style={{background: 'linear-gradient(90deg, #18CF4B 0%, #19B545 93.23%, #19B445 100%)'}}>
          <img src={ArrowClockWise} alt="ArrowClockWise" className="w-[15px] h-[15px]" />
          <p className="text-[#FFF] text-[14px] ml-[5px] font-semibold">Refresh</p>
        </div>
      </div>
      <table className="w-[100%]">
        <tr className='text-left font-semibold text-[#36597D] text-[14px]'>
          <th className="w-[12%] pb-[20px]">Invoice ID</th>
          <th className="w-[15%] pb-[20px]">Customer Name</th>
          <th className="w-[12%] pb-[20px]">Date</th>
          <th className="w-[12%] pb-[20px]">Due Date</th>
          <th className="w-[10%] pb-[20px]">Amount</th>
        </tr>
        {BillerInvoiceListData.map((invoice, index) => (
          <tr
            key = {index}
            className="text-[14px] font-normal leading-5 text-[#36597D]"
          >
            <td className="min-w-[12%] pb-[20px] text-[#564DCD] text-[14px] ">{invoice.invoiceId}</td>
            <td className="min-w-[15%] pb-[20px] text-[#8B9EB0] text-[14px]">{invoice.customerName}</td>
            <td className="min-w-[12%] pb-[20px] text-[#8B9EB0] text-[14px] ">{invoice.date}</td>
            <td className="min-w-[12%] pb-[20px] text-[#8B9EB0] text-[14px]">${invoice.dueDate}</td>
            <td className="min-w-[22%] pb-[20px] text-[#36597D] text-[14px]">${invoice.amount}</td>
          </tr>
        ))}
      </table>
      <div className='flex justify-end h-[15px]'>
        <p className="text-[#564DCD] text-[12px] font-bold cursor-pointer">View all</p>
      </div>
    </Container>
  )
}

export default BillerInvoiceList
