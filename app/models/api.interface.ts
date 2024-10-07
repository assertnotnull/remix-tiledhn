import { Section } from "./api.server";
import { Item, Comment } from "./apitype.server";

export interface IHackerNewsApi {
  getStory: (id: number) => Promise<Item>;
  getComments: (story: Pick<Item, "id" | "kids">) => Promise<Comment[]>;
  getPaginatedStoryIds: (
    section: Section,
    pageNumber: number,
  ) => Promise<number[]>;
  getStories: (section: Section, pageNumber: number) => Promise<Item[]>;
}
