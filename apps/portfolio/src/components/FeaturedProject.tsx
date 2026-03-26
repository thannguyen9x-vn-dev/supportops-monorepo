import { content } from "@/content/portfolio-content";

export function FeaturedProject() {
  const { project } = content;

  return (
    <section id={project.id} className="py-20 px-6 border-t border-zinc-800">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
          {project.heading}
        </p>
        <h2 className="text-3xl font-bold text-zinc-50 mb-1">{project.name}</h2>
        <p className="text-zinc-400 mb-6 text-base">{project.tagline}</p>

        <div className="rounded-xl border border-zinc-800 bg-surface overflow-hidden">
          <div className="p-6 md:p-8">
            <p className="text-zinc-400 leading-relaxed mb-8 max-w-3xl">
              {project.description}
            </p>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-2 mb-8">
              {project.highlights.map((item) => (
                <div key={item} className="flex items-start gap-2.5 py-1.5">
                  <svg
                    className="mt-0.5 shrink-0 text-accent"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M2.5 7.5L5.5 10.5L11.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 border-t border-zinc-800 pt-6">
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
              >
                Live Demo
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6h8M6 2l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-zinc-50 transition-colors"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Source Code
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
