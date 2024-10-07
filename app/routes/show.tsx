import { Await, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, defer } from "@remix-run/server-runtime";
import { Suspense } from "react";
import { Maybe } from "true-myth";
import Loading from "~/components/loading";
import Paginate from "~/components/pagination";
import { Grid } from "../components/grid";
import { container } from "tsyringe";
import { CacheApi } from "~/models/cached-api.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pageIndex = Maybe.of(url.searchParams.get("page")).mapOr(
    0,
    (page) => +page - 1,
  );

  const api = container.resolve(CacheApi);

  const stories = api.getStories("show", pageIndex);
  const numberOfPages = await api.getNumberOfPages("show");
  return defer({ stories, numberOfPages });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Await resolve={data.stories} errorElement={<div>Failed to load</div>}>
          {(stories) => <Grid stories={stories} />}
        </Await>
      </Suspense>
      <Paginate numberOfPages={data.numberOfPages} />
    </>
  );
}
