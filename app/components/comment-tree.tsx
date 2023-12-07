import type { Comment } from "~/models/apitype.server";

export default function CommentTree({ comments }: { comments: Comment[] }) {
  return (
    <ul className="list-none">
      {comments && comments.length
        ? comments.map((comment) => (
            <li key={comment.id}>
              {/* <div className="flex flex-start items-center pt-3">
                <div className="bg-base-300 w-2 h-2 rounded-full -ml-1 mr-3"></div>
                <p className="text-base-content text-sm">{comment.time}</p>
              </div> */}
              <div className="mt-0.5  mb-6">
                <div className="flex mb-1.5 gap-3">
                  <h4 className="text-accent font-semibold text-xl align-middle">
                    {comment.by}
                  </h4>
                  <p className="align-middle leading-7">{comment.time}</p>
                </div>

                {comment.text && (
                  <p
                    className="text-base-content mb-3"
                    dangerouslySetInnerHTML={{
                      __html: comment.text,
                    }}
                  ></p>
                )}
                <ul className="ml-4">
                  <CommentTree comments={comment.comments} />
                </ul>
              </div>
            </li>
          ))
        : null}
    </ul>
  );
}
