import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { Await, useLoaderData } from "@remix-run/react";
import { defer } from "@remix-run/server-runtime";
import { Suspense } from "react";
import { getItem, getTopStories } from "~/models/item.server";
import { redisclient } from "~/redis.server";
import { Grid } from "./grid";
import NavBar from "./nav";

export async function loader() {
  const cached = await redisclient.get("index");
  if (cached) {
    return defer({ stories: JSON.parse(cached) });
  }

  const storyIds = await getTopStories(20);
  const stories = await pipe(
    storyIds,
    toAsync,
    map((id) => getItem(id)),
    concurrent(10),
    toArray
  );
  redisclient.setex("index", 15 * 60, JSON.stringify(stories));

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
