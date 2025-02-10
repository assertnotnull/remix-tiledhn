import { Link, useAsyncValue, useNavigation } from "react-router";
import classNames from "classnames";
import type { Item } from "~/models/apitype.server";

export function Grid() {
  const stories = useAsyncValue() as Item[];
  const nav = useNavigation();

  return (
    <section className="bg-base-200 z-0 pb-1">
      <div
        className={classNames("px-6 pb-6 pt-20 mb-20 mx-auto", {
          "opacity-50": nav.state === "loading",
        })}
      >
        <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4">
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
                  <button className="btn btn-ghost" disabled type="button">
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
      </div>
    </section>
  );
}
