import type { CommentLeaf } from "~/models/item.server";

export default function CommentTree({ comments }: { comments: CommentLeaf[] }) {
  return (
    <ul>
      {comments && comments.length
        ? comments.map((comment) => (
            <li key={comment.id}>
              <div className="flex flex-start items-center pt-3">
                <div className="bg-gray-300 w-2 h-2 rounded-full -ml-1 mr-3"></div>
                <p className="text-gray-500 text-sm">{comment.time}</p>
              </div>
              <div className="mt-0.5 ml-4 mb-6">
                <h4 className="text-gray-800 font-semibold text-xl mb-1.5">
                  {comment.by}
                </h4>
                <p
                  className="text-gray-500 mb-3"
                  dangerouslySetInnerHTML={{
                    __html: comment.text,
                  }}
                ></p>
                <ul>
                  <CommentTree comments={comment.comments} />
                </ul>
              </div>
            </li>
          ))
        : null}
    </ul>
  );
}
