import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { O } from "@mobily/ts-belt";
import { Await, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { defer } from "@remix-run/server-runtime";
import { Suspense } from "react";
import { getStoryById, getTopStories } from "~/models/api.server";
import { Grid } from "./grid";
import NavBar from "./nav";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const page: number = pipe(
    O.fromNullable(url.searchParams.get("page")),
    O.mapWithDefault(0, (page: string) => parseInt(page))
  );

  const storyIds = await getTopStories(page);

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
