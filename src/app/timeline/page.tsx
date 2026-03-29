import { TimelineChart } from "./timeline-chart";
import timelineData from "@/lib/timeline-data.json";

interface RawEvent {
  firm: string;
  firmSlug: string;
  date: string;
  quarter: string;
  type: string;
  description: string;
}

export default function TimelinePage() {
  const events = timelineData as RawEvent[];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Market Activity Timeline</h1>
        <p className="text-muted-foreground mt-1">
          Aggregate AI-related activity across all {new Set(events.map((e) => e.firm)).size} firms, by type and quarter
        </p>
      </div>
      <TimelineChart events={events} />
    </div>
  );
}
