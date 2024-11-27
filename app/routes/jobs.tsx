import { useLoaderData } from "react-router";
import { LoaderFunctionArgs } from "react-router";
import Section, { getPageIndex } from "~/components/section";
import { container } from "~/container.server";
import { CacheApi } from "~/models/cached-api.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const pageIndex = getPageIndex(request.url);
  const api = container.get(CacheApi);

  const numberOfPages = await api.getNumberOfPages("job");
  const stories = api.getStories("job", pageIndex);

  return { stories, numberOfPages };
}

export async function action({ request }: { request: Request }) {}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return <Section stories={data.stories} numberOfPages={data.numberOfPages} />;
}
