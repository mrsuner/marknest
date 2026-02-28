"use client";

interface SharesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function SharesPagination({ currentPage, totalPages, onPageChange }: SharesPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8">
      <div className="join">
        <button 
          className="join-item btn btn-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          «
        </button>
        <button className="join-item btn btn-sm">
          Page {currentPage} of {totalPages}
        </button>
        <button 
          className="join-item btn btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          »
        </button>
      </div>
    </div>
  );
}