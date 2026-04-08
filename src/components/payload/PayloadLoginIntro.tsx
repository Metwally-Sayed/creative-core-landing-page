import Link from "next/link";
import { ArrowUpRight, FileImage, FolderKanban, ShieldCheck } from "lucide-react";

export default function PayloadLoginIntro() {
  const points = [
    {
      icon: FolderKanban,
      label: "Projects",
      value: "Publish featured work with cleaner editorial flow.",
    },
    {
      icon: FileImage,
      label: "Media",
      value: "Upload and manage visuals without leaving the CMS.",
    },
    {
      icon: ShieldCheck,
      label: "Team",
      value: "Keep access focused for editors and admins.",
    },
  ];

  return (
    <div className="payload-auth-intro">
      <div className="payload-auth-intro__eyebrow">Hello Monday CMS</div>
      <div className="payload-auth-intro__hero">
        <h1>Sign in to run the editorial desk.</h1>
        <p>
          Manage website content from a focused workspace shaped by the same palette,
          typography, and editorial rhythm as the public experience.
        </p>
      </div>
      <div className="payload-auth-intro__points">
        {points.map((point, index) => {
          const Icon = point.icon;

          return (
            <div key={point.label} className="payload-auth-intro__point">
              <div className="payload-auth-intro__point-marker">
                <span className="payload-auth-intro__point-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon className="h-4 w-4" />
              </div>
              <div className="payload-auth-intro__point-copy">
                <div className="payload-auth-intro__point-label">{point.label}</div>
                <div className="payload-auth-intro__point-value">{point.value}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="payload-auth-intro__footer">
        <div>
          <div className="payload-auth-intro__footer-label">Protected workspace</div>
          <p>
            Use your team credentials to update projects, upload assets, and keep publishing
            aligned with the live site.
          </p>
        </div>
        <Link
          className="payload-auth-intro__site-link"
          href="/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Open public site
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
