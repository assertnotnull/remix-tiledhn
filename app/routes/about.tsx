import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { createHash } from "crypto";
import { URL } from "url";

export function loader() {
  const emailHash = createHash("md5")
    .update("patgauth@gmail.com")
    .digest("hex");
  const size = 200;

  const imageUrl = new URL(
    `https://www.gravatar.com/avatar/${emailHash}?s=${size}`,
  );

  return json({ imageUrl });
}

export default function About() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row">
        <img src={data.imageUrl} className="max-w-sm rounded-full shadow-2xl" />
        <div>
          <h1 className="text-5xl font-bold">Patrice Gauthier</h1>
          <p className="py-6">
            Software engineer and architect with 13 years of experience.
            <br />
            #nodejs #react #microservices #terraform #elixir
          </p>
          <p className="pb-4">
            This plaform is using:{" "}
            <a className="link" href="//remix.run/" target="blank">
              Remix
            </a>
            ,{" "}
            <a className="link" href="//daisyui.com" target="blank">
              DaisyUI
            </a>
            ,{" "}
            <a className="link" href="//unstorage.unjs.io/" target="blank">
              Unstorage (Redis locally / vercel KV on Vercel)
            </a>
            ,{" "}
            <a className="link" href="//fxts.dev" target="blank">
              FxTS
            </a>
          </p>
          <a
            className="btn btn-primary mr-4"
            href="https://github.com/assertnotnull"
            target="blank"
          >
            Github
          </a>
          <a
            className="btn btn-primary mr-4"
            href="https://www.linkedin.com/in/patricegauthier/"
            target="blank"
          >
            LinkedIn
          </a>

          <a
            className="btn btn-primary mr-4"
            href="https://github.com/HackerNews/API"
            target="blank"
          >
            Hacker News API
          </a>
          <a
            className="btn btn-primary mr-4"
            href="https://github.com/assertnotnull/remix-tiledhn"
            target="blank"
          >
            Repo
          </a>
        </div>
      </div>
    </div>
  );
}
