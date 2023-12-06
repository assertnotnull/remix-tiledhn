import { pipe } from "@fxts/core";
import { z } from "zod";
import formatRelative from "date-fns/formatRelative/index.js";

//Zod schemas based on https://github.com/HackerNews/API, updated to actual API responses
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
const convertDateToRelative = (date: Date) => formatRelative(date, new Date());

export type ItemType = "job" | "story" | "comment" | "poll" | "pollopt";

// Creating a schema for each type below (job, story, etc.) provided no benefit as some values of itemSchema was there or not.
// It was just easier to have itemSchema represent all types.
const baseSchema = z.object({
  id: z.number(),
  type: z.enum(["job", "story", "comment", "poll", "pollopt", "comment"]),
  by: z.string().optional(),
  time: z
    .number()
    .or(z.string())
    .transform((val) =>
      typeof val === "number"
        ? pipe(val, convertTimeToDate, convertDateToRelative)
        : val
    ),
});

export const itemSchema = baseSchema.extend({
  title: z.string(),
  text: z.string().optional(),
  score: z.number(),
  url: z.string().nullable().optional(),
  descendants: z.number().optional(), //only for stories or polls - number of comments
  kids: z.array(z.number()).default([]), //comments
  dead: z.boolean().optional(),
});

export type Item = z.infer<typeof itemSchema>;

export const commentSchema = baseSchema.extend({
  type: z.literal("comment"),
  text: z.string().optional(),
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

export const storyIdsSchema = z.array(z.number());
