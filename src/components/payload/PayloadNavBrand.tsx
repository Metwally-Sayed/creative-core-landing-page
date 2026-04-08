import Link from "next/link";
import { ArrowUpRight, Sparkles, Command, Plus } from "lucide-react";

export default function PayloadNavBrand() {
  return (
    <div className="relative mb-6 w-full border-b border-white/10 pb-6 px-4 pt-4">
      {/* Ambient glow effect for a premium touch matching the payload-shell-gradient concept */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-white/5 to-transparent opacity-50 blur-xl" />

      <Link 
        className="group block no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-accent rounded-lg transition-all" 
        href="/admin"
      >
        <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-white/50 transition-colors group-hover:text-white/80">
          <div className="flex h-5 w-5 items-center justify-center rounded shadow-sm border border-white/10 bg-white/5">
            <Command className="h-3 w-3" />
          </div>
          Hello Monday
        </div>
        
        <div className="mt-3">
          <span className="block font-serif text-[1.65rem] font-medium leading-none tracking-tight text-white transition-colors">
            Content Desk
          </span>
        </div>
        
        <p className="mt-2 text-xs leading-relaxed text-white/60">
          Manage projects, media, and publishing in one unified workspace.
        </p>
      </Link>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          className="group relative flex items-center justify-between overflow-hidden rounded-lg border border-white/20 bg-white px-3.5 py-3 text-sm font-semibold text-[hsl(var(--accent))] shadow-[0_4px_14px_rgba(255,255,255,0.15)] transition-all hover:bg-white/95 hover:shadow-[0_6px_20px_rgba(255,255,255,0.25)] focus:outline-none focus:ring-2 focus:ring-white/40"
          href="/admin/collections/projects/create"
        >
          {/* Subtle shine effect on hover */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-[hsl(var(--accent))]/5 to-transparent -translate-x-full transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
          
          <span className="flex items-center gap-2 relative z-10">
            <Plus className="h-4 w-4" />
            Create Project
          </span>
          <ArrowUpRight className="h-4 w-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>

        <Link
          className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-white/80 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[hsl(var(--secondary))] transition-colors group-hover:text-amber-400" />
            Public View
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-40 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}
