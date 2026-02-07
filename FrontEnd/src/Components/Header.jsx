export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
            <span className="text-sm font-black tracking-tight text-white">TM</span>
          </div>
          <div className="text-base font-black tracking-tight text-white">
            TaskMaster
          </div>
        </div>
      </div>
    </header>
  );
}
