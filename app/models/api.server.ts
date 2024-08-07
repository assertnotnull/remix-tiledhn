import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import {
  commentTreeSchema,
  itemSchema,
  storyIdsSchema,
} from "./apitype.server";

const root = "https://hacker-news.firebaseio.com/v0/";
const itemPath = `${root}/item`;

export type Section = "top" | "job" | "ask" | "show";

async function callAPI(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
}

export function getItem(id: number) {
  return callAPI(`${itemPath}/${id}.json`);
}

export async function getStoryIdsBySection(
  section: Section,
): Promise<number[]> {
  const url = `${root}/${section}stories.json`;
  return pipe(callAPI(url), storyIdsSchema.parse);
}

export async function getStoryById(id: number) {
  const item = await getItem(id);
  try {
    return itemSchema.parse(item);
  } catch (err) {
    console.log({ err, itemInError: item, id });
    throw err;
  }
}

export async function getComment(id: number) {
  const comment = await pipe(
    callAPI(`${itemPath}/${id}.json`),
    commentTreeSchema.parse,
  );

  comment.comments = await pipe(
    comment.kids,
    toAsync,
    map(getComment),
    concurrent(20),
    toArray,
  );
  return comment;
}

//The api returns a fixed number of story ids per section, so we need to paginate them
export async function paginateStoryIds(key: Section) {
  const storyIds = await getStoryIdsBySection(key);
  return splitEvery(20, storyIds);
}

function splitEvery<T extends Array<string | number>>(
  sliceLength: number,
  listOrString: T,
) {
  const batches: Array<Array<string | number>> = [];
  let counter = 0;
  while (counter < listOrString.length) {
    batches.push(listOrString.slice(counter, (counter += sliceLength)));
  }
  return batches;
}
