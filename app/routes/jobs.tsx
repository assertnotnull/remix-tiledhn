import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import type { Story } from "~/models/item.server";
import { getJobStories, getItem } from "~/models/item.server";
import { Grid } from "./grid";
import NavBar from "./nav";

export async function loader() {
  const storyIds = await getJobStories(20);
  const stories = await Promise.all(storyIds.map((id) => getItem(id)));
  return json(stories);
}

export default function Index() {
  const stories = useLoaderData<Story[]>();
  return (
    <main>
      <NavBar />
      <Grid stories={stories} />
    </main>
  );
}
