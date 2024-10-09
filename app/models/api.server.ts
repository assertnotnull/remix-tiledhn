import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import {
  commentTreeSchema,
  Item,
  itemSchema,
  storyIdsSchema,
} from "./apitype.server";
import { IHackerNewsApi } from "./api.interface";
import { singleton } from "tsyringe";

export type Section = "top" | "job" | "ask" | "show";

@singleton()
export class HackerNewsApi implements IHackerNewsApi {
  itemPath: string;
  paginatedStoryIds = new Map<string, number[][]>();
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

  async getComments(story: Pick<Item, "id" | "kids">) {
    return pipe(
      story.kids,
      toAsync,
      map((id) => this.getComment(+id)),
      concurrent(20),
      toArray,
    );
  }

  async getStory(storyId: number) {
    const storyData = await this.getItem(storyId);
    const story = itemSchema.parse(storyData);
    return story;
  }

  async getStories(section: Section, pageNumber: number) {
    const storyIds = await this.getPaginatedStoryIds(section, pageNumber);
    return pipe(
      storyIds,
      toAsync,
      map((id) => this.getStory(id)),
      map((item) => itemSchema.parse(item)),
      concurrent(10),
      toArray,
    );
  }

  async fetchAndSplitStoryIds(key: Section): Promise<number[][]> {
    const storyIds = await this.getStoryIdsBySection(key);
    return splitEvery(20, storyIds);
  }

  async cacheStoryIds(section: Section) {
    if (!this.paginatedStoryIds.has(section)) {
      const storyIds = await this.fetchAndSplitStoryIds(section);
      this.paginatedStoryIds.set(section, storyIds);
    }
  }

  async getPaginatedStoryIds(section: Section, pageNumber: number) {
    await this.cacheStoryIds(section);
    return this.paginatedStoryIds.get(section)![pageNumber]!;
  }

  async getNumberOfPages(section: Section) {
    await this.cacheStoryIds(section);
    return this.paginatedStoryIds.get(section)?.length ?? 0;
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
