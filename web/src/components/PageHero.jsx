function PageHero({ eyebrow, title, description, actions }) {
  return (
    <section className="panel overflow-hidden bg-mesh p-6 sm:p-8 md:p-10 lg:p-12">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">{eyebrow}</p>
      <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base md:text-lg">{description}</p>
      {actions ? <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">{actions}</div> : null}
    </section>
  );
}

export default PageHero;
