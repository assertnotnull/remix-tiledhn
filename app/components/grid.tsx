import { Link, useSearchParams } from "@remix-run/react";
import classNames from "classnames";
import type { Item } from "~/models/apitype.server";

export function Grid({
  stories,
  numberOfPages,
}: {
  stories: Item[];
  numberOfPages: number;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = searchParams.get("page") ?? "1";

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="px-6 py-10 mx-auto">
        <div className="grid grid-cols-4 gap-4">
          {stories.map((story) => (
            <div key={story.id} className="card w-full bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{story.title}</h2>
                <p>
                  {story.score} points - {story.time}
                </p>

                {story.url ? (
                  <a
                    className="btn btn-primary"
                    href={story.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Source
                  </a>
                ) : (
                  <button className="btn btn-ghost" disabled>
                    No source
                  </button>
                )}
                <Link to={`/story/${story.id}`} className="btn btn-ghost">
                  Details - {story.descendants ?? "No"} Comments
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center py-4 gap-1">
          {new Array(numberOfPages).fill(0).map((_, i) => (
            <button
              key={i}
              className={classNames("btn", {
                "btn-active": i + 1 == +currentPage,
              })}
              onClick={() => {
                const indexPlusOne = i + 1;
                const params = new URLSearchParams();
                params.set("page", indexPlusOne.toString());
                setSearchParams(params);
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
