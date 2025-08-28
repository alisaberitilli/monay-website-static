import React, { useState } from 'react';
import { CloseButton } from '../../../../components/atoms/IconButton';
import Button from '../../../../components/atoms/Button';
import Container from '../../../../components/atoms/Container';

const inputStyle = 'rounded-[5px] opacity-70 bg-base text-input-shadow border border-solid border-white'

interface BillEntryFormState {
  biller: string;
  account: string;
  lineItems: LineItem[];
}

interface FormFields {
  item: string;
  description: string;
  units_price: string;
  quantity: string;
  amount: string;
}

interface LineItem {
  item: string;
  description: string;
  quantity: number;
  pricePerAmount: number;
  additionalSurcharges: number;
}

interface AutocompleteOption {
  id: number;
  name: string;
}

const CreateInvoice = () => {
  const [autocompleteValue, setAutocompleteValue] = useState('');
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [newItems, setNewItems] = useState({});
  const [forms, setForms] = useState<FormFields[]>([
    { item: '', description: '', units_price: '', quantity: '', amount: '' }, 
  ]);

  const addForm = () => {
    setForms([...forms, { item: '', description: '', units_price: '', quantity: '', amount: '' }]);
  };

  const removeForm = (index: number) => {
    const updatedForms = [...forms];
    updatedForms.splice(index, 1);
    setForms(updatedForms);
  };

  const handleInputChange = (index: number, field: keyof FormFields, value: string) => {
    const updatedForms = [...forms];
    updatedForms[index][field] = value;
    setForms(updatedForms);
  };

  const getInputs = (value, name) => {
    console.log({ [name]: value });
    let data = { [name]: value };
    setNewItems({ ...newItems, ...data });
  };

  const saveData = (event) => {
    event.preventDefault();
    console.log(newItems);
  }

  const handleAutocompleteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setAutocompleteValue(value);
    // autocomplete logic fetch data
  };

  const handleAutocompleteSelect = (option: AutocompleteOption) => {
    setAutocompleteValue(option.name);
    // based on the selected option change invoice date and due date
    setInvoiceDate(new Date()); 
    setDueDate(new Date()); 
  };

  return (
    <div className="p-[10px]">
      <p className="heading-page mb-[30px]">CreateInvoice</p>
      <Container
        className='p-[30px]'
      >
        <p className='text-[#36597D] text-[16px] font-bold mb-[10px]'>Bill entry</p>
        <div className='flex w-[90%]'>
          <div className='grow'>
            <p className='text-[#8B9EB0] text-[14px] font-semibold mb-[5px]'>Invoice number*</p>
            <input
              className={`${inputStyle} w-[100%]`}
              type="text"
              value={autocompleteValue}
              onChange={handleAutocompleteChange}
            />
          </div>
          <div className='shrink-0 ml-[20px]'>
            <p className='text-[#8B9EB0] text-[14px] font-semibold mb-[5px]'>Invoice date*</p>
            <input
              className={inputStyle}
              type="date"
              value={invoiceDate ? invoiceDate.toISOString().split('T')[0] : ''}
              onChange={(event) => setInvoiceDate(new Date(event.target.value))}
              disabled={!autocompleteValue}
            />
          </div>
          <div className='shrink-0 ml-[20px]'>
            <p className='text-[#8B9EB0] text-[14px] font-semibold mb-[5px]'>Due date*</p>
            <input
              className={inputStyle}
              type="date"
              value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
              onChange={(event) => setDueDate(new Date(event.target.value))}
              disabled={!autocompleteValue}
            />
          </div>
        </div>

        <div className='flex mt-[30px] mb-[5px] w-full'>
          <p className='text-[#8B9EB0] text-[14px] font-semibold w-[24%]'>Item</p>
          <p className='text-[#8B9EB0] text-[14px] font-semibold w-[39%]'>Description</p>
          <p className='text-[#8B9EB0] text-[14px] font-semibold w-[8%]'>Units price</p>
          <p className='text-[#8B9EB0] text-[14px] font-semibold w-[9%]'>Quantity</p>
          <p className='text-[#8B9EB0] text-[14px] font-semibold'>Amount</p>
        </div>

        {forms.map((form, index) => (
          <form key={index} className='flex w-full mb-[20px]'>
            <input name="item" value={form.item} onChange={(event) => {handleInputChange(index, 'item', event.target.value), getInputs(event.target.value, event.target.name)}} className={`${inputStyle} grow-[2] w-[35%]`} />
            <input name="description" value={form.description} onChange={(event) => {handleInputChange(index, 'description', event.target.value), getInputs(event.target.value, event.target.name)}} className={`${inputStyle} grow-[3] ml-[20px] w-[60%]`} />
            <input name="units_price" value={form.units_price} onChange={(event) => {handleInputChange(index, 'units_price', event.target.value), getInputs(event.target.value, event.target.name)}} className={`${inputStyle} grow-0 ml-[20px] w-[10%]`} />
            <input name="quantity" value={form.quantity} onChange={(event) => {handleInputChange(index, 'quantity', event.target.value), getInputs(event.target.value, event.target.name)}} className={`${inputStyle} grow ml-[20px] w-[10%]`} />
            <input name="amount" value={form.amount} onChange={(event) => {handleInputChange(index, 'amount', event.target.value), getInputs(event.target.value, event.target.name)}} className={`${inputStyle} grow-[1] ml-[20px] w-[20%]`} />
            <div onClick={() => removeForm(index)} className='ml-[20px] w-[10%]'><CloseButton disabled={false} Icon size={"small"} /></div>
          </form>
        ))}

        <button onClick={addForm} className='flex mt-[10px] mr-4 ml-[auto] px-[20px] py-[10px] justify-end items-center rounded-[20px] h-[40px] w-[99px]' style={{border: "1px solid #FFF", background: "#F1F5FC", boxShadow: "-8px -8px 16px 0px #FFF, 8px 8px 16px 0px #C9D9E8"}}>
          <p className='text-[13px] text-[#36597D] font-semibold'>Add item</p> 
        </button>

        <div className='flex flex-col my-[20px] w-[30%]'>
          <p className='text-[16px] text-[#36597D] font-bold'>Summary</p>
          <div className='mt-[10px] flex justify-between'>
            <p className='font-normal text-[16px] text-[#36597D]'>Subtotal</p>
            <p className='font-semibold text-[16px] text-[#36597D]'>$000.00</p>
          </div>
          <div className='mt-[10px] flex justify-between pb-[15px]' style={{borderBottom: "1px solid rgba(139, 158, 176, 0.20)"}}>
            <p className='font-normal text-[16px] text-[#36597D]'>Charges</p>
            <p className='font-semibold text-[16px] text-[#36597D]'>$0.00</p>
          </div>
          <div className='mt-[10px] flex justify-between pb-[15px]' style={{borderBottom: "1px solid rgba(139, 158, 176, 0.20)"}}>
            <p className='font-normal text-[16px] text-[#36597D]'>Amount paid</p>
            <p className='font-semibold text-[16px] text-[#36597D]'>$000.00</p>
          </div>
        </div>

        <div className='flex justify-center items-center py-[20px]'>
          <Button size='big' onClick={saveData}>Save</Button>
        </div>

      </Container>
    </div>
  )
}

export default CreateInvoice


