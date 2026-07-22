import { ArrowRight, Sparkles } from "lucide-react";
import { getNavigationItem } from "../lib/navigation";

export default function ComingSoonView({ view, onBackToDashboard }) {
  const item = getNavigationItem(view);
  const Icon = item?.Icon || Sparkles;

  return (
    <div className="view coming-soon-view">
      <div className="coming-soon-panel">
        <div className="coming-soon-icon">
          <Icon size={22} strokeWidth={1.9} />
        </div>
        <span className="coming-soon-kicker">Coming soon</span>
        <h1>{item?.label || "New workspace"}</h1>
        <p>
          {item?.description || "This part of Warmline is being shaped for a future release."}
        </p>
        <button className="btn btn-ghost" onClick={onBackToDashboard}>
          <ArrowRight size={15} /> Back to dashboard
        </button>
      </div>
    </div>
  );
}
