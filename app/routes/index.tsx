import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { Await, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { defer } from "@remix-run/server-runtime";
import { Suspense } from "react";
import { Maybe } from "true-myth";
import { getStoryById } from "~/models/api.server";
import { getCachedPaginatedStoryIds } from "~/models/cached-api.server";
import { Grid } from "./grid";
import NavBar from "./nav";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const page = Maybe.of(url.searchParams.get("page")).mapOr(0, (page) => +page);

  const { page: storyIds } = await getCachedPaginatedStoryIds("top", page);
  const stories = await pipe(
    storyIds,
    toAsync,
    map(getStoryById),
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
