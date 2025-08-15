import { DayGroup } from "@/types/neo";
import EventCard from "./EventCard";
import { formatDateForDisplay } from "@/lib/date";

interface EventDayGroupProps {
  dayGroup: DayGroup;
}

export default function EventDayGroup({ dayGroup }: EventDayGroupProps) {
  return (
    <div>
      <div className="flex items-center mb-3">
        <h2 className="text-xl font-semibold">{formatDateForDisplay(dayGroup.date)}</h2>
        <span className="ml-2 px-2 py-0.5 bg-secondary text-secondary-foreground text-sm rounded-full">
          {dayGroup.count} {dayGroup.count === 1 ? "object" : "objects"}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dayGroup.neos.map((neo) => (
          <EventCard key={neo.id} neo={neo} />
        ))}
      </div>
    </div>
  );
}
