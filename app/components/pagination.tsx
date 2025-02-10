import { useSearchParams } from "react-router";
import classNames from "classnames";

const Paginate = ({ numberOfPages }: { numberOfPages: number }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = searchParams.get("page") ?? "1";

  const handlePageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPage = event.target.value;
    const params = new URLSearchParams();
    params.set("page", selectedPage);
    setSearchParams(params);
  };

  return (
    <div className="flex justify-center py-4 gap-1 fixed bottom-0 w-full bg-primary-content">
      <div className="hidden md:flex">
        {new Array(numberOfPages).fill(0).map((_, i) => (
          <button
            key={i}
            className={classNames("btn", {
              "btn-active": i + 1 == +currentPage,
            })}
            onClick={() => {
              const indexPlusOne = i + 1;
              const params = new URLSearchParams();
              if (+currentPage !== indexPlusOne) {
                params.set("page", indexPlusOne.toString());
                setSearchParams(params);
              }
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="md:hidden">
        <select
          className="select select-bordered"
          value={currentPage}
          onChange={handlePageChange}
        >
          {new Array(numberOfPages).fill(0).map((_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Paginate;
