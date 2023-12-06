import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import CommentTree from "~/components/comment-tree";
import { getComment, getItem } from "~/models/api.server";
import {
  commentTreeSchema,
  itemSchema,
  type Comment,
} from "~/models/apitype.server";
import { cacheClient } from "~/redis.server";
import NavBar from "../../components/nav";

export async function loader({ params }: { params: { storyId: number } }) {
  const story = await getItem(params.storyId);
  return json(itemSchema.parse(story));
}

type ActionData = {
  comments: Comment[];
};

export async function action({ request }: { request: Request }) {
  const body = await request.formData();
  const intent = body.get("intent");
  const storyId = body.get("storyId");
  if (intent === "loadComment") {
    const cachedComments = await cacheClient.get(`comments:${storyId}`);
    if (cachedComments) {
      return json({ comments: JSON.parse(cachedComments) });
    }
    const kidCommentIds: string = (body.get("kids") as string) || "";
    const comments = await pipe(
      kidCommentIds.split(","),
      toAsync,
      map((id) => getComment(+id)),
      concurrent(20),
      toArray
    );
    cacheClient.setex(`comments:${storyId}`, 10 * 60, JSON.stringify(comments));
    return json({
      comments: comments.map((comment) => commentTreeSchema.parse(comment)),
    });
  }
  return json({ comments: [] });
}

export default function Index() {
  const story = useLoaderData<typeof loader>();
  const data = useActionData<ActionData>();

  const transition = useNavigation();
  const isLoadingComments = transition.state === "submitting";

  return (
    <Form method="post">
      <input type="hidden" name="storyId" value={story.id} />
      <section className="bg-white dark:bg-gray-900">
        <div className="px-6 py-10 mx-auto">
          <div className="grid grid-cols-1 gap-4">
            <div className="card w-full bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{story.title}</h2>
                <p>
                  {story.score} - {story.time}
                </p>
                {story.text ? (
                  <div>
                    <br />
                    <p dangerouslySetInnerHTML={{ __html: story.text }}></p>
                  </div>
                ) : null}
                {story.url ? (
                  <a className="btn btn-primary" href={story.url}>
                    Source
                  </a>
                ) : null}
                {story.descendants ? (
                  <button
                    type="submit"
                    name="intent"
                    value="loadComment"
                    className="btn btn-ghost"
                    disabled={
                      isLoadingComments ||
                      (data?.comments && data?.comments.length > 0)
                    }
                  >
                    {isLoadingComments
                      ? "loading comments.."
                      : `${story.descendants} Comments`}
                  </button>
                ) : (
                  <button className="btn btn-ghost" disabled>
                    No comments
                  </button>
                )}
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
  );
}
