import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { A } from "@mobily/ts-belt";
import { redisclient } from "~/redis.server";
import type { Item } from "./apitype.server";
import {
  commentTreeSchema,
  itemSchema,
  storyIdsSchema,
} from "./apitype.server";

const root = "https://hacker-news.firebaseio.com/v0/";
const itemPath = `${root}/item`;

const callAPI = async (url: string) => {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.log(err);
    return;
  }
};

async function getCached<T>(key: string, call: () => Promise<T>) {
  const cached = await redisclient.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  return call();
}

type Section = "top" | "job" | "ask" | "show";

export async function getStoryIdsBySection(
  section: Section,
  qty = 20,
  apiFunction = callAPI
): Promise<number[]> {
  const url = `${root}/${section}stories.json`;
  return pipe(callAPI(url), storyIdsSchema.parse);
}

export function cache15Min(key: string, item: Item) {
  return redisclient.setex(key, 15 * 60, JSON.stringify(item));
}

export async function getStoryById(id: number) {
  return getCached<Item>(`item:${id}`, async () => {
    const item = await callAPI(`${itemPath}/${id}.json`);
    try {
      const validItem = itemSchema.parse(item);
      cache15Min(`item:${id}`, validItem);
      return validItem;
    } catch (err) {
      console.log({ err, itemInError: item, id });
      throw err;
    }
  });
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

async function paginateStoryIds(key: Section, page: number) {
  const storyIds = await getStoryIdsBySection(key);
  const pagedIds = A.splitEvery(storyIds, 20);
  pagedIds.forEach((storyIds, i) =>
    redisclient.setex(`top:${i}`, 15 * 60, JSON.stringify(storyIds))
  );
  redisclient.set(`${key}:pages`, pagedIds.length);
  return pagedIds[page];
}

export async function getTopStories(page: number) {
  return getCached<readonly number[]>(`top:${page}`, async () =>
    paginateStoryIds("top", page)
  );
}

export async function getJobStories(page: number) {
  return getCached<readonly number[]>(`job:${page}`, async () =>
    getStoryIdsBySection("job", page)
  );
}

export async function getAskStories(page: number) {
  return getCached<readonly number[]>(`ask:${page}`, async () =>
    getStoryIdsBySection("ask", page)
  );
}

export async function getShowStories(page: number) {
  return getCached<readonly number[]>(`show:${page}`, async () =>
    getStoryIdsBySection("show", page)
  );
}
