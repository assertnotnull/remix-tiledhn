import { Await, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, defer } from "@remix-run/server-runtime";
import { Suspense } from "react";
import { Maybe } from "true-myth";
import { container } from "tsyringe";
import Loading from "~/components/loading";
import Paginate from "~/components/pagination";
import { CacheApi } from "~/models/cached-api.server";
import { Grid } from "../components/grid";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pageIndex = Maybe.of(url.searchParams.get("page")).mapOr(
    0,
    (page) => +page - 1,
  );
  const api = container.resolve(CacheApi);

  const numberOfPages = await api.getNumberOfPages("job");
  const stories = api.getStories("job", pageIndex);

  return defer({ stories, numberOfPages });
}

export async function action({ request }: { request: Request }) {}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Suspense fallback={<Loading />}>
        <Await resolve={data.stories} errorElement={<div>Failed to load</div>}>
          <Grid />
        </Await>
      </Suspense>
      <Paginate numberOfPages={data.numberOfPages} />
    </>
  );
}
