import { D } from "@mobily/ts-belt";

export type ItemType = "job" | "story" | "comment" | "poll" | "pollopt";

export type Item = {
  id: string;
  type: ItemType;
  by: string;
  time: number;
  text: string;
};

export type Comment = Item & {
  type: "comment";
  parent: string;
  kids: string[];
};

export type CommentLeaf = Comment & {
  comments: CommentLeaf[];
};

export type Story = Item & {
  type: "story";
  title: string;
  url: string;
  score: string;
  kids: string[];
  descendants: number;
};

export type Ask = Item & {
  type: "ask";
  title: string;
  url: string;
  score: string;
  kids: string[];
  descendants: number;
};

export type Poll = Item & {
  type: "poll";
  title: string;
  parts: string[];
  score: number;
  descendants: number;
};

export type PollOpt = Item & {
  type: "pollopt";
  score: number;
};

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

export async function getCommentLeaf(id: string) {
  const comment = await callAPI<Comment>(`${itemPath}/${id}.json`);
  const leaf = toCommentLeaf(comment);
  leaf.comments = await Promise.all(
    leaf.kids?.map((kid) => getCommentLeaf(kid)) ?? []
  );
  return leaf;
}

function toCommentLeaf(comment: Comment): CommentLeaf {
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
