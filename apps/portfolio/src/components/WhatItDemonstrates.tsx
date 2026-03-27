import { content } from "@/content/portfolio-content";

export function WhatItDemonstrates() {
  const { demonstrates } = content;

  return (
    <section className="py-20 px-6 border-t border-zinc-800">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold text-zinc-50 mb-8">
          {demonstrates.heading}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {demonstrates.items.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-zinc-800 bg-surface p-5 hover:border-zinc-700 transition-colors"
            >
              <h3 className="text-sm font-semibold text-zinc-50 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
