import { DayGroup } from "@/types/neo";
import { NEO } from "@/types/neo";
import { formatDateForDisplay } from "@/lib/date";
import EventCard from "./EventCard";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface EventDayGroupProps {
  dayGroup: { date: string; neos: NEO[]; count: number };
}

export default function EventDayGroup({ dayGroup }: EventDayGroupProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold">{formatDateForDisplay(dayGroup.date)}</h2>
        <Badge variant="secondary" className="ml-3">
          {dayGroup.count} {dayGroup.count === 1 ? "object" : "objects"}
        </Badge>
      </div>
      
      <Separator className="mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dayGroup.neos.map((neo) => (
          <EventCard key={neo.id} neo={neo} />
        ))}
      </div>
    </div>
  );
}
