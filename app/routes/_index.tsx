import { Await, useLoaderData, useNavigation } from "@remix-run/react";
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

  const stories = api.getStories("top", pageIndex);
  const numberOfPages = await api.getNumberOfPages("top");

  return defer({ stories, numberOfPages });
}

const pathForLoading = ["/", "/jobs", "/ask", "/show"];

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <>
      {pathForLoading.includes(navigation.location?.pathname ?? "") &&
        navigation.state === "loading" && <Loading />}
      <Suspense fallback={<Loading />}>
        <Await resolve={data.stories} errorElement={<div>Failed to load</div>}>
          {(stories) => <Grid stories={stories} />}
        </Await>
      </Suspense>
      <Paginate numberOfPages={data.numberOfPages} />
    </>
  );
}
