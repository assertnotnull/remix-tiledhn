import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { D, flow } from "@mobily/ts-belt";
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

const convertTimeToDate = (time: number) => new Date(time * 1000);
const convertDateToIntlFormat = (date: Date) =>
  new Intl.DateTimeFormat("en-US", formatOptions).format(date);

export type ItemType = "job" | "story" | "comment" | "poll" | "pollopt";
const itemSchema = z.object({
  id: z.number(),
  type: z.enum(["job", "story", "comment", "poll", "pollopt"]),
  by: z.string().optional(),
  time: z.number().transform(flow(convertTimeToDate, convertDateToIntlFormat)),
  text: z.string().optional(),
});

export type Item = z.infer<typeof itemSchema>;

export const commentSchema = itemSchema.extend({
  type: z.literal("comment"),
  parent: z.number(),
  kids: z.array(z.number()).optional(),
});

export type Comment = z.infer<typeof commentSchema> & {
  comments: Comment[];
};

//@ts-ignore zod can't reassign time number to string
export const commentTreeSchema: z.ZodType<Comment> = commentSchema.extend({
  comments: z.lazy(() => commentTreeSchema.array()),
});

const titleUrlSchema = itemSchema.extend({
  title: z.string(),
  url: z.string(),
  score: z.number(),
  kids: z.array(z.number()).nullable(),
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

const callAPI = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  return res.json();
};

export async function getStories(
  section: "top" | "job" | "ask" | "show",
  qty: number = 20
) {
  const url = `${root}/${section}stories.json`;
  const stories = await callAPI<string[]>(url);
  return stories.slice(0, qty);
}

export function getTopStories(qty: number = -1) {
  return getStories("top", qty);
}

export function getItem<T>(id: string) {
  return callAPI<T>(`${itemPath}/${id}.json`);
}

export async function getComment(id: number) {
  const comment = await callAPI<Comment>(`${itemPath}/${id}.json`);
  const leaf = toCommentLeaf(comment);
  leaf.comments = leaf.kids
    ? await pipe(
        leaf.kids,
        toAsync,
        map((kid) => getComment(kid)),
        concurrent(20),
        toArray
      )
    : [];
  return leaf;
}

function toCommentLeaf(comment: Comment): Comment {
  return D.set(structuredClone(comment), "comments", []);
}

export async function getJobStories(qty: number) {
  return getStories("job", qty);
}

export async function getAskStories(qty: number) {
  return getStories("ask", qty);
}

export async function getShowStories(qty: number) {
  return getStories("show", qty);
}
