import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { flow } from "@mobily/ts-belt";
import { z } from "zod";

const formatOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
};

const storyIdsSchema = z.array(z.number());

const convertTimeToDate = (time: number) => new Date(time * 1000);
const convertDateToIntlFormat = (date: Date) =>
  new Intl.DateTimeFormat("en-US", formatOptions).format(date);

export type ItemType = "job" | "story" | "comment" | "poll" | "pollopt";
const itemSchema = z.object({
  id: z.number(),
  type: z.enum(["job", "story", "comment", "poll", "pollopt"]),
  by: z.string().optional(),
  time: z
    .number()
    .or(z.string())
    .transform((val) =>
      typeof val === "number"
        ? flow(convertTimeToDate, convertDateToIntlFormat)(val)
        : val
    ),
  text: z.string().optional(),
});

export type Item = z.infer<typeof itemSchema>;

export const commentSchema = itemSchema.extend({
  type: z.literal("comment"),
  parent: z.number(),
  kids: z.array(z.number()).default([]),
});

export type Comment = z.infer<typeof commentSchema> & {
  comments: Comment[];
};

//@ts-ignore zod can't reassign time number to string
export const commentTreeSchema: z.ZodType<Comment> = commentSchema.extend({
  comments: z.lazy(() => commentTreeSchema.array().default([])),
});

const titleUrlSchema = itemSchema.extend({
  title: z.string(),
  url: z.string().nullable().optional(),
  score: z.number(),
  kids: z.array(z.number()).default([]),
  descendants: z.number(),
});

export const storySchema = titleUrlSchema.extend({
  type: z.literal("story"),
});

export type Story = z.infer<typeof storySchema>;

export const askSchema = titleUrlSchema.extend({
  type: z.literal("ask"),
});

export type Ask = z.infer<typeof askSchema>;

const pollSchema = itemSchema.extend({
  type: z.literal("poll"),
  title: z.string(),
  parts: z.array(z.string()),
  score: z.number(),
  descendants: z.number(),
});

export type Poll = z.infer<typeof pollSchema>;

const pollOptSchema = itemSchema.extend({
  type: z.literal("pollopt"),
  score: z.number(),
});

export type PollOpt = z.infer<typeof pollOptSchema>;

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

export function getTopStories(qty: number = -1) {
  return getStoryIdsBySection("top", qty);
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
    map((kid) => getComment(kid)),
    concurrent(20),
    toArray
  );
  return comment;
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
