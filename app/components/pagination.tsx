import React from "react";

const Paginate = ({
  perPage,
  total,
  goToPage,
}: {
  perPage: number;
  total: number;
  goToPage: (page: number) => void;
}) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(total / perPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination-container">
      <ul className="pagination">
        {pageNumbers.map((number) => (
          <li
            key={number}
            onClick={() => goToPage(number)}
            className="page-number"
          >
            {number}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Paginate;
