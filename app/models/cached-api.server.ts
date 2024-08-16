import { Maybe } from "true-myth";
import { cacheClient } from "~/redis.server";
import type { Section } from "./api.server";
import { getStoryById, paginateStoryIds } from "./api.server";
import type { Item } from "./apitype.server";

export async function getCached<T>(
  key: string,
  call: () => Promise<T>,
): Promise<T> {
  try {
    const cached = (await cacheClient.getItem(key)) as T;
    return cached ? cached : call();
  } catch (err) {
    console.log(err);
    return call();
  }
}

export function getCachedStoryById(id: number) {
  return getCached<Item>(`item:${id}`, async () => {
    const story = await getStoryById(id);
    cacheClient.setItem(`item:${id}`, JSON.stringify(story), {
      ttl: 15 * 60,
    });
    return story;
  });
}

export async function getCachedPaginatedStoryIds(
  section: Section,
  pageNumber: number,
) {
  const pageOfStoryIds = await getCached(
    `${section}:${pageNumber}`,
    async () => {
      const pagedIds = await paginateStoryIds(section);
      pagedIds.forEach((storyIds, i) =>
        cacheClient.setItem(`${section}:${i}`, JSON.stringify(storyIds), {
          ttl: 15 * 60,
        }),
      );
      cacheClient.setItem(`${section}:total`, pagedIds.length);
      return pagedIds[pageNumber] ?? [];
    },
  );

  const numberOfPages = Maybe.of(
    await cacheClient.getItem(`${section}:total`),
  ).mapOr(20, (total) => +total);

  return {
    pageOfStoryIds,
    numberOfPages,
  };
}
