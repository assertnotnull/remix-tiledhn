import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { Await, useLoaderData, useSearchParams } from "@remix-run/react";
import { LoaderFunctionArgs, defer } from "@remix-run/server-runtime";
import { Suspense } from "react";
import { getStoryById } from "~/models/api.server";
import { getCachedPaginatedStoryIds } from "~/models/cached-api.server";
import { Grid } from "../components/grid";
import { Maybe } from "true-myth";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pageIndex = Maybe.of(url.searchParams.get("page")).mapOr(
    0,
    (page) => +page - 1
  );

  const { page: storyIds, numberOfPages } = await getCachedPaginatedStoryIds(
    "ask",
    pageIndex
  );

  const stories = await pipe(
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
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={data.stories} errorElement={<div>Failed to load</div>}>
        {(stories) => (
          <Grid stories={stories} numberOfPages={data.numberOfPages} />
        )}
      </Await>
    </Suspense>
  );
}
