import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import * as R from "ramda";
import CommentTree from "~/components/comment-tree";
import type { CommentLeaf, Story } from "~/models/item.server";
import { getCommentLeaf, getItem } from "~/models/item.server";
import NavBar from "../nav";

export async function loader({ params }: { params: { storyId: string } }) {
  const story = await getItem<Story>(params.storyId);
  return json(story);
}

type ActionData = {
  comments: CommentLeaf[];
};

const formatOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
};

const convertTimeToDate = ({ time }: { time: number }) => new Date(time * 1000);
const convertDateToIntlFormat = (date: Date) =>
  new Intl.DateTimeFormat("en-US", formatOptions).format(date);
const convertTimePipeline = <T extends { time: number }>(item: T) =>
  R.pipe(convertTimeToDate, convertDateToIntlFormat, (datestring) =>
    R.assoc("time", datestring, item)
  )(item);

export async function action({ request }: { request: Request }) {
  const body = await request.formData();
  const intent = body.get("intent");
  if (intent === "loadComment") {
    const kids: string = (body.get("kids") as string) || "";
    const comments = await Promise.all(
      kids.split(",").map((id) => getCommentLeaf(id))
    );

    return json({ comments: comments.map(convertTimePipeline) });
  }
  return json({});
}

export default function Index() {
  const story = useLoaderData<Story>();
  const data = useActionData<ActionData>();

  const transition = useTransition();
  const isLoading = transition.state === "loading";
  const isLoadingComments = transition.submission;

  return (
    <main>
      <NavBar />
      <Form method="post">
        <section className="bg-white dark:bg-gray-900">
          <div className="px-6 py-10 mx-auto">
            <div className="grid grid-cols-1 gap-4">
              <div className="card w-full bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">{story.title}</h2>
                  <p>
                    {story.score} -{" "}
                    {new Date(story.time * 1000).toLocaleString()}
                  </p>
                  <a className="btn btn-primary" href={story.url}>
                    Source
                  </a>
                  <button
                    type="submit"
                    name="intent"
                    value="loadComment"
                    className="btn btn-ghost"
                  >
                    {isLoadingComments
                      ? "loading comments.."
                      : `${story.descendants} Comments`}
                  </button>
                  <input type="hidden" name="kids" value={story.kids} />
                  <ul>
                    <CommentTree comments={data?.comments ?? []} />
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Form>
    </main>
  );
}
