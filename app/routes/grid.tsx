import { Link } from "@remix-run/react";
import type { Story } from "~/models/item.server";

export function Grid({ stories }: { stories: Story[] }) {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="px-6 py-10 mx-auto">
        <div className="grid grid-cols-4 gap-4">
          {stories.map((story) => (
            <div key={story.id} className="card w-full bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{story.title}</h2>
                <p>
                  {story.score} - {story.time}
                </p>

                <a
                  className="btn btn-primary"
                  href={story.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Source
                </a>
                <Link to={`/story/${story.id}`} className="btn btn-ghost">
                  {story.descendants} Comments
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
