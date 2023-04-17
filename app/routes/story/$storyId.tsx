import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import CommentTree from "~/components/comment-tree";
import type { Comment, Story } from "~/models/item.server";
import { storySchema } from "~/models/item.server";
import { commentTreeSchema, getComment, getItem } from "~/models/item.server";
import NavBar from "../nav";
import { map, pipe, tap, toArray, toAsync } from "@fxts/core";

export async function loader({ params }: { params: { storyId: number } }) {
  const story = await getItem(params.storyId);

  return json(storySchema.parse(story));
}

type ActionData = {
  comments: Comment[];
};

export async function action({ request }: { request: Request }) {
  const body = await request.formData();
  const intent = body.get("intent");
  if (intent === "loadComment") {
    const kids: string = (body.get("kids") as string) || "";
    const comments = await pipe(
      kids.split(","),
      toAsync,
      map((id) => getComment(parseInt(id))),
      toArray
    );

    return json({
      comments: comments.map((comment) => commentTreeSchema.parse(comment)),
    });
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
                    {story.score} - {story.time}
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
                  {story.kids && (
                    <input
                      type="hidden"
                      name="kids"
                      value={story.kids.toString()}
                    />
                  )}
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
