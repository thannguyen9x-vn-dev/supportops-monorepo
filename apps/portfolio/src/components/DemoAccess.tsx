import { content } from "@/content/portfolio-content";

export function DemoAccess() {
  const { demo } = content;

  return (
    <section id={demo.id} className="py-20 px-6 border-t border-zinc-800">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold text-zinc-50 mb-2">
          {demo.heading}
        </h2>
        <p className="text-zinc-400 mb-8 max-w-2xl">{demo.note}</p>

        {/* Role table */}
        <div className="rounded-xl border border-zinc-800 overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-surface">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Role
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Can do
                </th>
              </tr>
            </thead>
            <tbody>
              {demo.roles.map((item, i) => (
                <tr
                  key={item.role}
                  className={`border-b border-zinc-800 last:border-0 ${
                    i % 2 === 0 ? "bg-[#09090b]" : "bg-surface"
                  }`}
                >
                  <td className="px-5 py-3.5 font-medium text-zinc-200 whitespace-nowrap">
                    {item.role}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400">
                    {item.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <a
            href={demo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors w-fit"
          >
            Open Demo App
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2.5 7h9M7 2.5l4.5 4.5L7 11.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <p className="text-xs text-zinc-500">{demo.credential}</p>
        </div>
      </div>
    </section>
  );
}
