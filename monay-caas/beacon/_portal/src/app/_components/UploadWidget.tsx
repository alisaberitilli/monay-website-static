import React, { useState, useRef } from 'react';
import { Button, Container } from '../../../../_client/renderer/src/components/atoms';
import uploadIcon from '../../../../_client/renderer/src/assets/uploadIcon.png';

interface UploadWidgetProps {}

const UploadWidget: React.FC<UploadWidgetProps> = ({}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    }

    const handleDragLeave = () => {
        setIsDragOver(false);
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        handleUploadWidget(e.dataTransfer.files);
    }

    const handleFileButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleUploadWidget(e.target.files);
        }
    }

    const handleUploadWidget = (files: FileList) => {
        console.log('invoice:', files);
    }

    return (
        <Container type='neu'>
            <div
                className={`file-upload-container ${isDragOver ? 'drag-over' : ''} flex flex-col justify-center items-center`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <p 
                    style={{marginTop: '74px', marginBottom: '12px', width:'100px', height:'100px'}} 
                    className='rounded-[50%] flex justify-center items-center bg-blue-100 border border-white border-opacity-250 shadow-inner'
                >
                    <img src={uploadIcon} alt='uploadIcon' style={{width: '30px'}} />
                </p>
                <div className='flex flex-col justify-center items-center'>
                    <p className='text-[#36597D] text-[18px] font-semibold mb-[8px]'>Drag and Drop Invoice File</p>
                    <p className='text-[#8B9EB0] text-[14px] font-normal'>Format *Jpeg,Pdf,Xlx</p>
                </div>
                <Button 
                    block 
                    onClick={handleFileButtonClick} 
                    style={{width: '290px', marginBottom: '70px', marginTop: '24px'}}
                >
                    Upload Invoice
                </Button>
                <input
                    type="file"
                    ref={inputRef}
                    accept=".csv, .pdf, .edi, .xlsx"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                    multiple
                />
            </div>
        </Container>
        
    );
};

export default UploadWidget;