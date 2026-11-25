import { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { DRESS_CODE_STYLES, type DressCodeStyle } from '../data/eventData';

export function DressCodeSection() {
  const [selectedId, setSelectedId] = useState<DressCodeStyle['id']>('elegante');
  const activeStyle =
    DRESS_CODE_STYLES.find((style) => style.id === selectedId) ?? DRESS_CODE_STYLES[0];

  return (
    <section
      id="dresscode"
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 scroll-mt-20"
    >
      <div className="mb-10 max-w-2xl space-y-3">
        <p className="text-sm font-medium text-[#c4b5fd]">04. Imprescindible para embarcar</p>
        <h2 className="font-display text-[clamp(1.85rem,4vw,3.1rem)] font-semibold tracking-[-0.03em] text-[#f9fafb]">
          Gala Galáctica Urbana.
        </h2>
        <p className="text-base sm:text-lg leading-relaxed text-[#9ca3af]">
          Imagina a la aristocracia de <span className="text-[#f3f4f6]">Los Bridgerton</span>{' '}
          entrando en un club futurista de <span className="text-[#f3f4f6]">Blade Runner</span>.
        </p>
      </div>

      {/* Two core pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <article className="interactive-surface relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0e1017] p-6 sm:p-8 lg:p-10 hover:border-white/[0.15]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-[#8b5cf6]/18 blur-[60px]"
          />
          <div className="relative z-10">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/12 text-[#c4b5fd]">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-display text-2xl font-semibold tracking-tight text-[#f9fafb] mb-2">
              Base Elegante
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-[#9ca3af]">
              Traje, vestido, camisa, pajarita, terciopelo o joyas llamativas. Presencia de alta
              sociedad galáctica.
            </p>
          </div>
        </article>

        <article className="interactive-surface relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0e1017] p-6 sm:p-8 lg:p-10 hover:border-white/[0.15]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-[#3b82f6]/18 blur-[60px]"
          />
          <div className="relative z-10">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3b82f6]/30 bg-[#3b82f6]/12 text-[#93c5fd]">
              <Zap className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-display text-2xl font-semibold tracking-tight text-[#f9fafb] mb-2">
              Toque Urbano &amp; Espacial
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-[#9ca3af]">
              Bambas o zapatillas, gafas de sol futuristas, detalles metalizados, acentos en morado
              o azul eléctrico y guiños cósmicos.
            </p>
          </div>
        </article>
      </div>

      {/* Interactive Style Guide Panel */}
      <div className="mt-5 rounded-3xl border border-white/[0.08] bg-[#0e1017] p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/[0.07] pb-6">
          <div>
            <p className="text-xs font-medium text-[#9ca3af]">Guía rápida de vestuario</p>
            <h3 className="mt-1 font-display text-xl sm:text-2xl font-semibold text-[#f9fafb]">
              Cómo clavar el look sin complicarte
            </h3>
          </div>

          <div
            role="tablist"
            aria-label="Guía de estilo de vestuario"
            className="inline-flex flex-wrap sm:flex-nowrap items-center gap-1 rounded-2xl bg-white/[0.04] p-1 border border-white/[0.06]"
          >
            {DRESS_CODE_STYLES.map((style) => {
              const isSelected = style.id === selectedId;
              return (
                <button
                  key={style.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedId(style.id)}
                  className={`min-h-[44px] flex-1 sm:flex-none rounded-xl px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] ${
                    isSelected
                      ? 'bg-[#f9fafb] text-[#06070b]'
                      : 'text-[#9ca3af] hover:text-white'
                  }`}
                >
                  {style.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          key={activeStyle.id}
          role="tabpanel"
          className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-fade-up"
        >
            <div className="lg:col-span-5 space-y-2.5">
              <h4 className="font-display text-lg sm:text-xl font-semibold text-white">
                {activeStyle.title}
              </h4>
              <p className="text-sm sm:text-base leading-relaxed text-[#9ca3af]">
                {activeStyle.summary}
              </p>
              <p className="pt-2 text-xs sm:text-sm text-[#9ca3af]">
                <span className="font-medium text-[#d1d5db]">Evita:</span> {activeStyle.avoid}
              </p>
            </div>

            <div className="lg:col-span-7">
              <p className="text-xs font-medium text-[#9ca3af] mb-3">Claves recomendadas</p>
              <ul className="space-y-2.5">
                {activeStyle.pieces.map((piece) => (
                  <li
                    key={piece}
                    className="flex items-start gap-3 text-sm sm:text-base text-[#e5e7eb] leading-relaxed"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#60a5fa]"
                    />
                    <span>{piece}</span>
                  </li>
                ))}
              </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
