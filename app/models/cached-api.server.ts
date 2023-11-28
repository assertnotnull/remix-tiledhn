import { Maybe } from "true-myth";
import { redisclient } from "~/redis.server";
import type { Section } from "./api.server";
import { getStoryById, paginateStoryIds } from "./api.server";
import type { Item } from "./apitype.server";

export async function getCached<T>(
  key: string,
  call: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redisclient.get(key);
    return cached ? JSON.parse(cached) : call();
  } catch (err) {
    console.log(err);
    return call();
  }
}

export function getCachedStoryById(id: number) {
  return getCached<Item>(`item:${id}`, () => getStoryById(id));
}

export async function getCachedPaginatedStoryIds(
  section: Section,
  pageNumber: number
) {
  const pageOfIds = await getCached(`${section}:${pageNumber}`, async () => {
    const pagedIds = await paginateStoryIds(section);
    pagedIds.forEach((storyIds, i) =>
      redisclient.setex(`${section}:${i}`, 15 * 60, JSON.stringify(storyIds))
    );
    redisclient.set(`${section}:total`, pagedIds.length);
    return pagedIds[pageNumber] ?? [];
  });

  const numberOfPages = Maybe.of(
    await redisclient.get(`${section}:total`)
  ).mapOr(20, (total) => +total);

  return {
    page: pageOfIds,
    numberOfPages,
  };
}

export function cache15Min(key: string, item: Item) {
  return redisclient.setex(key, 15 * 60, JSON.stringify(item));
}
