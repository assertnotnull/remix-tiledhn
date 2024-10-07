import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import {
  commentTreeSchema,
  itemSchema,
  storyIdsSchema,
} from "./apitype.server";

export type Section = "top" | "job" | "ask" | "show";

export class HackerNewsApi {
  itemPath: string;
  constructor(private root = "https://hacker-news.firebaseio.com/v0") {
    this.itemPath = `${root}/item`;
  }

  private async callAPI(url: string): Promise<string | null> {
    try {
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  getItem(id: number) {
    return this.callAPI(`${this.itemPath}/${id}.json`);
  }

  private async getStoryIdsBySection(section: Section): Promise<number[]> {
    const url = `${this.root}/${section}stories.json`;
    return pipe(this.callAPI(url), storyIdsSchema.parse);
  }

  async getStoryById(id: number) {
    const item = await this.getItem(id);

    return itemSchema.parse(item);
  }

  async getComment(id: number) {
    const comment = await pipe(
      this.callAPI(`${this.itemPath}/${id}.json`),
      commentTreeSchema.parse,
    );

    comment.comments = await pipe(
      comment.kids,
      toAsync,
      map((comment) => this.getComment(comment)),
      concurrent(20),
      toArray,
    );
    return comment;
  }

  async paginateStoryIds(key: Section) {
    const storyIds = await this.getStoryIdsBySection(key);
    return splitEvery(20, storyIds);
  }
}

function splitEvery<T extends Array<number>>(
  sliceLength: number,
  listOrString: T,
) {
  const batches: Array<Array<number>> = [];
  let counter = 0;
  while (counter < listOrString.length) {
    batches.push(listOrString.slice(counter, (counter += sliceLength)));
  }
  return batches;
}
