import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { commentTreeSchema, storyIdsSchema } from "./apitype.server";

const root = "https://hacker-news.firebaseio.com/v0/";
const itemPath = `${root}/item`;

const callAPI = async (url: string) => {
  const res = await fetch(url);
  return res.json();
};

export async function getStoryIdsBySection(
  section: "top" | "job" | "ask" | "show",
  qty: number = 20
): Promise<number[]> {
  const url = `${root}/${section}stories.json`;
  return pipe(callAPI(url), storyIdsSchema.parse, (stories) =>
    stories.slice(0, qty)
  );
}

export function getItem(id: number) {
  return callAPI(`${itemPath}/${id}.json`);
}

export async function getComment(id: number) {
  const comment = await pipe(
    callAPI(`${itemPath}/${id}.json`),
    commentTreeSchema.parse
  );

  comment.comments = await pipe(
    comment.kids,
    toAsync,
    map(getComment),
    concurrent(20),
    toArray
  );
  return comment;
}

export function getTopStories(qty: number) {
  return getStoryIdsBySection("top", qty);
}

export async function getJobStories(qty: number) {
  return getStoryIdsBySection("job", qty);
}

export async function getAskStories(qty: number) {
  return getStoryIdsBySection("ask", qty);
}

export async function getShowStories(qty: number) {
  return getStoryIdsBySection("show", qty);
}
