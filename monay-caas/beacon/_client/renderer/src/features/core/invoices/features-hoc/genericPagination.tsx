import { Container } from '#client/components/atoms';
import React, { useState, useEffect } from 'react';
import PaginationNext from '#client/assets/buttons/PaginationNext.png';
import PaginationPrev from '#client/assets/buttons/PaginationPrev.png';

interface PaginationProps {
  numberOfItems: number;
  dataPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ numberOfItems = 40, dataPerPage = 5, onPageChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(numberOfItems / dataPerPage);
  const maxSelectablePages = Math.min(totalPages, 5);

  useEffect(() => {
    setCurrentPage(1);
  }, [numberOfItems, dataPerPage]);

  useEffect(() => {
    onPageChange(currentPage);
  }, [currentPage]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div>
      <Container type="neu" className='w-[380px] h-[66px] flex justify-center items-center'>
      <button onClick={goToPreviousPage} disabled={currentPage === 1}>
        <img src={PaginationPrev} alt="pagination previous" className='h-[40px] w-[40px]' />
      </button> 
      <div className='text-[16px] font-[500] text-[#6E8AA6]'>
      {Array.from({ length: maxSelectablePages }, (_, index) => {
        const page = index + 1;
        return (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            disabled={currentPage === page}
            className={` mx-[20px] my-[13px]`}
            style={currentPage === page ? { border: "1px solid #D6E3F3", borderRadius: "12px", background: "#E3EDF7", opacity: "0.7", boxShadow: "4px 4px 14px 0px #C1D5EE inset, -4px -4px 9px 0px rgba(255, 255, 255, 0.88) inset" } : {}}
          >
            <p style={currentPage === page ? {color: "#7B61FF", fontSize: "16px", padding: "5px"} : {}}>{page}</p>
          </button>
        );
      })}
      </div>
      <button onClick={goToNextPage} disabled={currentPage === totalPages}>
        <img src={PaginationNext} alt="pagination next" className='h-[40px] w-[40px]' />
      </button>
      </Container>
    </div>
  );
};

export default Pagination;
