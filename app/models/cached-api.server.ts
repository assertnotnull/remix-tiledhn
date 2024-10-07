import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import "reflect-metadata";
import { Maybe } from "true-myth";
import { inject, injectable } from "tsyringe";
import { KvCache } from "~/redis.server";
import type { HackerNewsApi, Section } from "./api.server";
import { Comment, itemSchema, type Item } from "./apitype.server";

@injectable()
export class CacheApi {
  constructor(
    @inject("kvcache") private cache: KvCache,
    @inject("api") private api: HackerNewsApi,
  ) {}

  getStoryById(id: number) {
    return this.cache.getCached<Item>(`item:${id}`, async () => {
      const story = await this.api.getStoryById(id);
      this.cache.client.setItem(`item:${id}`, JSON.stringify(story), {
        ttl: 15 * 60,
      });
      return story;
    });
  }

  async getCachedPaginatedStoryIds(section: Section, pageNumber: number) {
    return this.cache.getCached(`${section}:${pageNumber}`, async () => {
      const pagedIds = await this.api.paginateStoryIds(section);
      pagedIds.forEach((storyIds, i) =>
        this.cache.client.setItem(`${section}:${i}`, JSON.stringify(storyIds), {
          ttl: 15 * 60,
        }),
      );
      this.cache.client.setItem(`${section}:total`, pagedIds.length);
      return pagedIds[pageNumber] ?? [];
    });
  }

  async getNumberOfPages(section: Section) {
    const pageCount = await this.cache.client.getItem(`${section}:total`);
    return Maybe.of(pageCount).mapOr(20, (total) => +total);
  }

  async getStories(section: Section, pageNumber: number) {
    const pageOfStoryIds = await this.getCachedPaginatedStoryIds(
      section,
      pageNumber,
    );

    return pipe(
      pageOfStoryIds,
      toAsync,
      map((id) => this.getCachedStoryById(id)),
      map((item) => itemSchema.parse(item)),
      concurrent(10),
      toArray,
    );
  }

  private getCachedStoryById(id: number) {
    return this.cache.getCached<Item>(`item:${id}`, async () => {
      const story = await this.api.getStoryById(id);
      this.cache.client.setItem(`item:${id}`, JSON.stringify(story), {
        ttl: 15 * 60,
      });
      return story;
    });
  }

  async getStoryComments(storyId: number) {
    const story = await this.getStory(storyId);
    return { story, comments: this.getComments(story) };
  }

  getComments(story: Pick<Item, "id" | "kids">) {
    return this.cache.getCached<Comment[]>(`comments:${story.id}`, async () => {
      const comments = await pipe(
        story.kids,
        toAsync,
        map((id) => this.api.getComment(+id)),
        concurrent(20),
        toArray,
      );
      this.cache.client.setItem(
        `comments:${story.id}`,
        JSON.stringify(comments),
        {
          ttl: 10 * 60,
        },
      );
      return comments;
    });
  }

  async getStory(storyId: number) {
    const storyData = await this.api.getItem(storyId);
    const story = itemSchema.parse(storyData);
    return story;
  }
}
