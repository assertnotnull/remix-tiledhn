import { useLoaderData } from "react-router";
import { LoaderFunctionArgs } from "react-router";
import { container } from "tsyringe";
import Section, { getPageIndex } from "~/components/section";
import { CacheApi } from "~/models/cached-api.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const pageIndex = getPageIndex(request.url);
  const api = container.resolve(CacheApi);

  const numberOfPages = await api.getNumberOfPages("job");
  const stories = api.getStories("job", pageIndex);

  return { stories, numberOfPages };
}

export async function action({ request }: { request: Request }) {}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return <Section stories={data.stories} numberOfPages={data.numberOfPages} />;
}
