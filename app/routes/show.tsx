import { LoaderFunctionArgs, useLoaderData } from "react-router";
import Section, { getPageIndex } from "~/components/section";
import { container } from "~/container.server";
import { CacheApi } from "~/models/cached-api.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const pageIndex = getPageIndex(request.url);

  const api = container.get(CacheApi);

  const numberOfPages = await api.getNumberOfPages("show");
  const stories = api.getStories("show", pageIndex);
  return { stories, numberOfPages };
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return <Section stories={data.stories} numberOfPages={data.numberOfPages} />;
}
