import { content } from "@/content/portfolio-content";

export function Skills() {
  const { skills } = content;

  return (
    <section id={skills.id} className="py-20 px-6 border-t border-zinc-800">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold text-zinc-50 mb-8">
          {skills.heading}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {skills.groups.map((group) => (
            <div
              key={group.category}
              className="rounded-lg border border-zinc-800 bg-surface p-5"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                {group.category}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {group.items.map((item) => (
                  <li key={item} className="text-sm text-zinc-300">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
