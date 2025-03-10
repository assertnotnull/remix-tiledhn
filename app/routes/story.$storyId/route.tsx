import { Suspense } from "react";
import { Await, Form, useLoaderData, useNavigation } from "react-router";
import CommentTree from "~/components/comment-tree";
import { container } from "~/container.server";
import { type Comment } from "~/models/apitype.server";
import { CacheApi } from "~/models/cached-api.server";

export async function loader({ params }: { params: { storyId: number } }) {
  const api = container.get(CacheApi);
  const story = await api.getStory(+params.storyId);
  const comments = await api.getComments(story);

  return { story, comments };
}

type ActionData = {
  comments: Comment[];
};

export async function action({ request }: { request: Request }) {
  const body = await request.formData();
  const intent = body.get("intent");
  const storyId = body.get("storyId");
  const api = container.get(CacheApi);
  if (intent === "loadComment") {
    const kidCommentIds: string = (body.get("kids") as string) || "";
    const kids = kidCommentIds.split(",").map((v) => +v);
    const comments = await api.getComments({ id: +storyId!, kids });

    return {
      comments,
    };
  }
  return { comments: [] };
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
      <section className="bg-base-200 z-0">
        <div className="px-6 pb-6 pt-20 mb-20 mx-auto">
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
