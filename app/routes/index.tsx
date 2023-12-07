import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { Await, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, defer } from "@remix-run/server-runtime";
import { Suspense } from "react";
import { Maybe } from "true-myth";
import { getStoryById } from "~/models/api.server";
import { getCachedPaginatedStoryIds } from "~/models/cached-api.server";
import { Grid } from "../components/grid";
import Loading from "~/components/loading";
import Paginate from "~/components/pagination";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pageIndex = Maybe.of(url.searchParams.get("page")).mapOr(
    0,
    (page) => +page - 1
  );

  const { page: storyIds, numberOfPages } = await getCachedPaginatedStoryIds(
    "top",
    pageIndex
  );
  const stories = pipe(
    storyIds,
    toAsync,
    map(getStoryById),
    concurrent(10),
    toArray
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
