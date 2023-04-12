import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { useLoaderData, useTransition } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import Loader from "~/components/loading";
import type { Story } from "~/models/item.server";
import { getItem, getTopStories } from "~/models/item.server";
import { Grid } from "./grid";
import NavBar from "./nav";

export async function loader() {
  return pipe(getTopStories(20), (ids) =>
    pipe(ids, toAsync, map(getItem), concurrent(20), toArray, json)
  );
}

export default function Index() {
  const stories = useLoaderData<Story[]>();

  const transition = useTransition();
  const isLoading = transition.state === "loading";

  return (
    <main>
      <NavBar />
      {isLoading ? <Loader /> : <Grid stories={stories} />}
    </main>
  );
}
