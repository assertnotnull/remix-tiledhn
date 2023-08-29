import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { Await, useLoaderData } from "@remix-run/react";
import { defer } from "@remix-run/server-runtime";
import { Suspense } from "react";
import { getAskStories, getStoryById } from "~/models/api.server";
import { Grid } from "./grid";
import NavBar from "./nav";

export async function loader() {
  const storyIds = await getAskStories(0);
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
