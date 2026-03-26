import { content } from "@/content/portfolio-content";

export function About() {
  const { about } = content;

  return (
    <section id={about.id} className="py-20 px-6 border-t border-zinc-800">
      <div className="mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Text */}
          <div>
            <h2 className="text-2xl font-semibold text-zinc-50 mb-6">
              {about.heading}
            </h2>
            <div className="flex flex-col gap-4">
              {about.paragraphs.map((para, i) => (
                <p key={i} className="text-zinc-400 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {about.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-zinc-800 bg-surface p-5"
              >
                <div className="text-xl font-bold text-zinc-50 font-mono">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
