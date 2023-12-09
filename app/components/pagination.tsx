import { useSearchParams } from "@remix-run/react";
import classNames from "classnames";

const Paginate = ({ numberOfPages }: { numberOfPages: number }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = searchParams.get("page") ?? "1";

  return (
    <div className="flex justify-center py-4 gap-1 fixed bottom-0 w-full bg-primary-content">
      {new Array(numberOfPages).fill(0).map((_, i) => (
        <button
          key={i}
          className={classNames("btn", {
            "btn-active": i + 1 == +currentPage,
          })}
          onClick={() => {
            const indexPlusOne = i + 1;
            const params = new URLSearchParams();
            params.set("page", indexPlusOne.toString());
            setSearchParams(params);
          }}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};

export default Paginate;
