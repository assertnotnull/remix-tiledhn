import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { Await, useLoaderData } from "@remix-run/react";
import { defer } from "@remix-run/server-runtime";
import { Suspense } from "react";
import { getItem } from "~/models/api.server";
import { itemSchema } from "~/models/apitype.server";
import { getCachedPaginatedStoryIds } from "~/models/cached-api.server";
import { Grid } from "../components/grid";
import Loading from "~/components/loading";

export async function loader() {
  const { page: storyIds, numberOfPages } = await getCachedPaginatedStoryIds(
    "show",
    0
  );

  const stories = pipe(
    storyIds,
    toAsync,
    map((id) => getItem(id)),
    map((story) => itemSchema.parse(story)),
    concurrent(10),
    toArray
  );

  return defer({ stories, numberOfPages });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <Suspense fallback={<Loading />}>
      <Await resolve={data.stories} errorElement={<div>Failed to load</div>}>
        {(stories) => (
          <Grid stories={stories} numberOfPages={data.numberOfPages} />
        )}
      </Await>
    </Suspense>
  );
}
