function PageHero({ eyebrow, title, description, actions }) {
  return (
    <section className="panel overflow-hidden bg-mesh p-8 md:p-12">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">{eyebrow}</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">{description}</p>
      {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}

export default PageHero;
