import type { Story } from "~/models/item.server";
import * as R from "ramda";
import { Link } from "@remix-run/react";

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

export function Grid({ stories }: { stories: Story[] }) {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="px-6 py-10 mx-auto">
        <div className="grid grid-cols-4 gap-4">
          {stories.map(convertTimePipeline).map((story) => (
            <div key={story.id} className="card w-full bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{story.title}</h2>
                <p>
                  {story.score} - {story.time}
                </p>

                <a className="btn btn-primary" href={story.url}>
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
