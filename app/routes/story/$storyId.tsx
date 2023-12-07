import { concurrent, map, pipe, toArray, toAsync } from "@fxts/core";
import { Await, Form, useLoaderData, useNavigation } from "@remix-run/react";
import { defer, json } from "@remix-run/server-runtime";
import { Suspense } from "react";
import CommentTree from "~/components/comment-tree";
import { getComment, getItem } from "~/models/api.server";
import {
  commentTreeSchema,
  itemSchema,
  type Comment,
} from "~/models/apitype.server";
import { cacheClient } from "~/redis.server";

export async function loader({ params }: { params: { storyId: number } }) {
  const storyData = await getItem(params.storyId);
  const story = itemSchema.parse(storyData);
  const comments = pipe(
    story.kids,
    toAsync,
    map((id) => getComment(+id)),
    concurrent(20),
    toArray
  );

  return defer({ story, comments });
}

type ActionData = {
  comments: Comment[];
};

export async function action({ request }: { request: Request }) {
  const body = await request.formData();
  const intent = body.get("intent");
  const storyId = body.get("storyId");
  if (intent === "loadComment") {
    const cachedComments = (await cacheClient.getItem(
      `comments:${storyId}`
    )) as string;
    if (cachedComments) {
      return json({ comments: cachedComments });
    }
    const kidCommentIds: string = (body.get("kids") as string) || "";
    const comments = await pipe(
      kidCommentIds.split(","),
      toAsync,
      map((id) => getComment(+id)),
      concurrent(20),
      toArray
    );
    cacheClient.setItem(`comments:${storyId}`, JSON.stringify(comments), {
      ttl: 10 * 60,
    });
    return json({
      comments: comments.map((comment) => commentTreeSchema.parse(comment)),
    });
  }
  return json({ comments: [] });
}

function LoadingComments() {
  return (
    <div>
      Loading comments...
      <span className="loading loading-dots loading-md"></span>
    </div>
  );
}

export default function Index() {
  const { story, comments } = useLoaderData<typeof loader>();

  const transition = useNavigation();

  return (
    <Form method="post">
      <input type="hidden" name="storyId" value={story.id} />
      <section className="bg-base-200">
        <div className="px-6 py-10 mx-auto">
          <div className="grid grid-cols-1 gap-4">
            <div className="card w-full bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{story.title}</h2>
                <p>
                  {story.score} points - {story.time}
                </p>
                {story.text ? (
                  <div>
                    <br />
                    <p dangerouslySetInnerHTML={{ __html: story.text }}></p>
                  </div>
                ) : null}
                {story.url ? (
                  <a
                    className="btn btn-primary"
                    href={story.url}
                    target="_blank"
                  >
                    Source
                  </a>
                ) : null}
                <div className="mt-4 pt-4 border-t border-gray-500">
                  <Suspense fallback={<LoadingComments />}>
                    <Await resolve={comments}>
                      {(comments) => <CommentTree comments={comments} />}
                    </Await>
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Form>
  );
}
