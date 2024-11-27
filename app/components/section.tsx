import { Await } from "react-router";
import { Suspense } from "react";
import { Maybe } from "true-myth";
import { Item } from "~/models/apitype.server";
import ErrorDisplay from "./errorsection";
import { Grid } from "./grid";
import Loading from "./loading";
import Paginate from "./pagination";

export default function Section(data: {
  stories: Promise<Item[]>;
  numberOfPages: number;
}) {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Await resolve={data.stories} errorElement={<ErrorDisplay />}>
          <Grid />
        </Await>
      </Suspense>
      <Paginate numberOfPages={data.numberOfPages} />
    </>
  );
}

export const getPageIndex = (requrl: string) => {
  const url = new URL(requrl);
  const pageIndex = Maybe.of(url.searchParams.get("page")).mapOr(
    0,
    (page) => +page - 1,
  );

  return pageIndex;
};
