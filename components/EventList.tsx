import { DayGroup } from "@/types/neo";
import EventDayGroup from "./EventDayGroup";

interface EventListProps {
  dayGroups: DayGroup[];
}

export default function EventList({ dayGroups }: EventListProps) {
  // If no data, show empty state
  if (!dayGroups || dayGroups.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <p className="text-lg text-muted-foreground">No near-Earth objects found for the selected criteria.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or date range.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {dayGroups.map((dayGroup) => (
        <EventDayGroup key={dayGroup.date} dayGroup={dayGroup} />
      ))}
    </div>
  );
}
