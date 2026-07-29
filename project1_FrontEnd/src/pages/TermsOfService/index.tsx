import { useTermsOfService } from "./useHook";

export const TermsOfService = () => {
  const { t, activeSection, activeContent, scrollToSection } = useTermsOfService();

  // Render Page Header with Title and Effective date
  const renderHeader = () => {
    return (
      <div className="mb-12 border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{activeContent.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-455 font-semibold tracking-wider">{activeContent.effectiveDate}</p>
      </div>
    );
  };

  // Render Left Column containing Legal Text Sections
  const renderContent = () => {
    return (
      <div className="col-span-12 lg:col-span-9 text-slate-800 dark:text-slate-200">
        {/* Intro Section */}
        <div id="intro" className="scroll-mt-24 mb-10">
          <h2 className="text-3xl font-extrabold text-slate-955 dark:text-white mb-6">{activeContent.subtitle}</h2>
          <p className="leading-relaxed mb-6 text-base">{activeContent.intro}</p>

          {/* Simplified Box */}
          <div className="border-l-4 border-slate-350 dark:border-slate-700 pl-4 py-1 my-6 text-slate-650 dark:text-slate-400">
            <span className="font-bold text-sm uppercase tracking-wide block mb-1">{activeContent.simplifiedTitle}</span>
            <p className="text-sm italic leading-relaxed">{activeContent.simplifiedIntro}</p>
          </div>

          <p className="leading-relaxed font-semibold mb-4 text-base">{activeContent.guidelineHeader}</p>

          {/* Guidelines as native unordered list */}
          <ul className="list-disc pl-6 space-y-3 mb-6 text-base leading-relaxed">
            {activeContent.guidelines.map((g, idx) => (
              <li key={idx}>{g.text}</li>
            ))}
          </ul>

          <p className="leading-relaxed italic pt-4 border-t border-slate-200/60 dark:border-slate-800 text-base">{activeContent.agreementText}</p>
        </div>

        {/* Iterated Sections */}
        {activeContent.sections.map((sec) => (
          <div key={sec.id} id={sec.id} className="scroll-mt-24 pt-10 mt-10 border-t border-slate-200/80 dark:border-slate-800/80">
            <h3 className="text-2xl font-bold text-slate-955 dark:text-white mb-4">
              {sec.number}. {sec.title}
            </h3>

            {/* Simplified summary block */}
            <div className="border-l-4 border-slate-355 dark:border-slate-700 pl-4 py-0.5 my-4 text-slate-650 dark:text-slate-405">
              <span className="font-bold text-xs uppercase tracking-wide block mb-1">{activeContent.simplifiedTitle}</span>
              <p className="text-sm italic leading-relaxed">{sec.simplified}</p>
            </div>

            {/* Legal Body Paragraphs */}
            <div className="space-y-4 mb-4 text-base leading-relaxed text-slate-800 dark:text-slate-300">
              {sec.paragraphs.map((p, pIdx) => (
                <p key={pIdx}>{p}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render Right Column Sticky Navigation Menu
  const renderSidebar = () => {
    return (
      <div className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[80vh] overflow-y-auto pr-2">
        <nav className="flex flex-col border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => scrollToSection("intro")}
            className={`text-left py-4 border-b border-slate-200 dark:border-slate-800 text-sm transition-all w-full cursor-pointer hover:text-slate-950 dark:hover:text-white ${
              activeSection === "intro" ? "font-bold text-slate-955 dark:text-white" : "text-slate-555 dark:text-slate-455"
            }`}
          >
            {t("Giới thiệu chung")}
          </button>

          {activeContent.sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`text-left py-4 border-b border-slate-200/85 dark:border-slate-800 text-sm transition-all w-full cursor-pointer hover:text-slate-950 dark:hover:text-white ${
                activeSection === sec.id ? "font-bold text-slate-950 dark:text-white" : "text-slate-550 dark:text-slate-455"
              }`}
            >
              {sec.number}. {sec.title}
            </button>
          ))}
        </nav>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 py-12">
      <div className="max-w-8xl">
        {renderHeader()}
        <div className="grid grid-cols-12 gap-12 items-start">
          {renderContent()}
          {renderSidebar()}
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
