export default function AppFooter() {
  return (
    <footer className="relative z-10 mt-auto px-4 pb-6 pt-2 sm:px-6 lg:px-8">
      <div className="glass-panel mx-auto flex max-w-6xl flex-col gap-4 rounded-[28px] px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-kicker">Built by</p>
          <p className="display-font text-lg text-slate-900">Tejas Bembade</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="info-pill">Information Technology</span>
          <span className="info-pill">Roll No: 123103035</span>
          <span className="info-pill">NIT Kurukshetra</span>
        </div>
      </div>
    </footer>
  );
}
