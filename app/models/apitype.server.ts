import { pipe } from "@fxts/core";
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
  time: z
    .number()
    .or(z.string())
    .transform((val) =>
      typeof val === "number"
        ? pipe(val, convertTimeToDate, convertDateToIntlFormat)
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
  descendants: z.number().optional(),
});

export const storySchema = titleUrlSchema.extend({
  type: z.enum(["story", "job"]),
  text: z.string().optional(),
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

export const storyIdsSchema = z.array(z.number());
