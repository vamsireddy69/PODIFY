import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: string; // YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  className?: string;
}

export function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  // Parse initial date & time from value
  const initialDate = value ? new Date(value) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    isNaN(initialDate.getTime()) ? new Date() : initialDate
  );

  // Time state: "HH:MM" (24h format)
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    if (value && value.includes("T")) {
      return value.split("T")[1].slice(0, 5);
    }
    // Default to current time
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });

  // Keep track of the calendar's current month/year view
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selectedDate || new Date()
  );

  // Update parent when selectedDate or selectedTime changes
  useEffect(() => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}T${selectedTime}`);
    }
  }, [selectedDate, selectedTime, onChange]);

  // Sync state if value prop changes from outside
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setCurrentMonth(d);
        if (value.includes("T")) {
          setSelectedTime(value.split("T")[1].slice(0, 5));
        }
      }
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleMonthChange = (monthStr: string) => {
    const monthIdx = parseInt(monthStr, 10);
    const newMonth = new Date(currentMonth.getFullYear(), monthIdx, 1);
    setCurrentMonth(newMonth);
    if (selectedDate) {
      const updated = new Date(selectedDate);
      updated.setMonth(monthIdx);
      setSelectedDate(updated);
    }
  };

  const handleYearChange = (yearStr: string) => {
    const yearNum = parseInt(yearStr, 10);
    const newMonth = new Date(yearNum, currentMonth.getMonth(), 1);
    setCurrentMonth(newMonth);
    if (selectedDate) {
      const updated = new Date(selectedDate);
      updated.setFullYear(yearNum);
      setSelectedDate(updated);
    }
  };

  // Convert 24h string ("HH:MM") to 12h pieces
  const parse24h = (time24: string) => {
    const [hStr, mStr] = time24.split(":");
    const h24 = parseInt(hStr, 10) || 0;
    const m = mStr || "00";
    const period = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return { hour: String(h12), minute: m, period };
  };

  // Convert 12h pieces to 24h string ("HH:MM")
  const formatTo24h = (hour12: string, minute: string, period: string) => {
    let h = parseInt(hour12, 10);
    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${minute}`;
  };

  const { hour, minute, period } = parse24h(selectedTime);

  const handleHourChange = (newHour: string) => {
    setSelectedTime(formatTo24h(newHour, minute, period));
  };

  const handleMinuteChange = (newMinute: string) => {
    setSelectedTime(formatTo24h(hour, newMinute, period));
  };

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedTime(formatTo24h(hour, minute, newPeriod));
  };

  // Generate years list (current year to +15 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);

  const months = [
    { label: "January", value: 0 },
    { label: "February", value: 1 },
    { label: "March", value: 2 },
    { label: "April", value: 3 },
    { label: "May", value: 4 },
    { label: "June", value: 5 },
    { label: "July", value: 6 },
    { label: "August", value: 7 },
    { label: "September", value: 8 },
    { label: "October", value: 9 },
    { label: "November", value: 10 },
    { label: "December", value: 11 },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className={cn(
              "w-full justify-start text-left font-normal border-border/40 bg-background/50 hover:bg-background/80 hover:text-foreground text-foreground h-10 px-3 transition-colors",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            {selectedDate ? (
              format(new Date(`${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}`), "PPP p")
            ) : (
              <span>Pick a date & time</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 glass-strong border-border/40 z-[60] flex flex-col gap-3" align="start">
          {/* Custom Month and Year Selectors */}
          <div className="flex gap-2">
            <Select
              value={String(currentMonth.getMonth())}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="flex-1 bg-background/40 border-border/40 text-xs h-8">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="glass-strong border-border/40 max-h-56 z-[70]">
                {months.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)} className="text-xs">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(currentMonth.getFullYear())}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-24 bg-background/40 border-border/40 text-xs h-8">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="glass-strong border-border/40 max-h-56 z-[70]">
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)} className="text-xs">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Calendar picker */}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border border-border/20 p-1"
          />

          {/* Time Picker */}
          <div className="flex flex-col gap-2 border-t border-border/20 pt-3 mt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Select Release Time</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Select value={hour} onValueChange={handleHourChange}>
                <SelectTrigger className="w-16 bg-background/40 border-border/40 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-border/40 max-h-48 z-[70]">
                  {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                    <SelectItem key={h} value={h} className="text-xs">
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-xs text-muted-foreground">:</span>

              <Select value={minute} onValueChange={handleMinuteChange}>
                <SelectTrigger className="w-16 bg-background/40 border-border/40 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-border/40 max-h-48 z-[70]">
                  {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                    <SelectItem key={m} value={m} className="text-xs">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-20 bg-background/40 border-border/40 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-border/40 z-[70]">
                  <SelectItem value="AM" className="text-xs">AM</SelectItem>
                  <SelectItem value="PM" className="text-xs">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
