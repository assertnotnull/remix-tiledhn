import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { Await, useLoaderData } from "@remix-run/react";
import { defer } from "@remix-run/server-runtime";
import { Suspense } from "react";
import { getItem } from "~/models/api.server";
import { itemSchema } from "~/models/apitype.server";
import { getCachedPaginatedStoryIds } from "~/models/cached-api.server";
import { Grid } from "./grid";
import NavBar from "./nav";

export async function loader() {
  const { page: storyIds } = await getCachedPaginatedStoryIds("show", 0);

  const stories = await pipe(
    storyIds,
    toAsync,
    map((id) => getItem(id)),
    map((story) => itemSchema.parse(story)),
    concurrent(10),
    toArray
  );

  return defer({ stories });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <main>
      <NavBar />
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={data.stories} errorElement={<div>Failed to load</div>}>
          {(stories) => <Grid stories={stories} />}
        </Await>
      </Suspense>
    </main>
  );
}
