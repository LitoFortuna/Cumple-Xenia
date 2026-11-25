import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GALA_FAQ_ITEMS } from '../data/eventData';

export function GalaGuideSection() {
  const [openId, setOpenId] = useState<string | null>(GALA_FAQ_ITEMS[0]?.id ?? null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="como-funciona"
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 scroll-mt-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 space-y-3">
          <p className="text-sm font-medium text-[#60a5fa]">03. Cómo funciona la noche</p>
          <h2 className="font-display text-[clamp(1.85rem,4vw,3rem)] font-semibold tracking-[-0.03em] text-[#f9fafb]">
            Dudas rápidas antes de embarcar.
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#9ca3af]">
            Todo lo esencial para disfrutar del Cluedo en Vivo sin presión teatral y sin destripar
            ningún secreto antes de la gala.
          </p>
        </div>

        <div className="lg:col-span-7 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {GALA_FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            const panelId = `faq-panel-${item.id}`;
            const buttonId = `faq-trigger-${item.id}`;

            return (
              <div key={item.id}>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(item.id)}
                  className="flex min-h-[56px] w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-sm"
                >
                  <span className="font-display text-base sm:text-lg font-medium text-[#f3f4f6]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#9ca3af] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#93c5fd]' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="pb-5 pr-6 text-sm sm:text-base leading-relaxed text-[#9ca3af] animate-fade-up"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
