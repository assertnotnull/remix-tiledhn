import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { Await, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, defer } from "@remix-run/server-runtime";
import { Suspense } from "react";
import { getItem } from "~/models/api.server";
import { itemSchema } from "~/models/apitype.server";
import { getCachedPaginatedStoryIds } from "~/models/cached-api.server";
import { Grid } from "../components/grid";
import Loading from "~/components/loading";
import Paginate from "~/components/pagination";
import { Maybe } from "true-myth";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pageIndex = Maybe.of(url.searchParams.get("page")).mapOr(
    0,
    (page) => +page - 1,
  );

  const { pageOfStoryIds, numberOfPages } = await getCachedPaginatedStoryIds(
    "show",
    pageIndex,
  );

  const stories = pipe(
    pageOfStoryIds,
    toAsync,
    map((id) => getItem(id)),
    map((story) => itemSchema.parse(story)),
    concurrent(10),
    toArray,
  );

  return defer({ stories, numberOfPages });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Await resolve={data.stories} errorElement={<div>Failed to load</div>}>
          {(stories) => (
            <Grid stories={stories} numberOfPages={data.numberOfPages} />
          )}
        </Await>
      </Suspense>
      <Paginate numberOfPages={data.numberOfPages} />
    </>
  );
}
