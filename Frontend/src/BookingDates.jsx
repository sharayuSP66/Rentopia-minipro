import { differenceInCalendarDays, format } from "date-fns";
import { IoCloudyNightSharp } from "react-icons/io5";
import { BsCalendar2Date } from "react-icons/bs";

export default function BookingDates({ booking, className }) {
  return (
    <div className={"flex gap-1 flex-col  justify-start  " + className}>
      <div className=" flex gap-1 items-center">
        <span>
          <IoCloudyNightSharp />
        </span>
        {differenceInCalendarDays(
          new Date(booking.checkOut),
          new Date(booking.checkIn)
        )}{" "}
        Night
      </div>

      <div className="flex items-center gap-4 ">
        <span>
          <BsCalendar2Date />
        </span>
        {format(new Date(booking.checkIn), "yyyy-MM-dd")}

        <span>
          <BsCalendar2Date />
        </span>
        {format(new Date(booking.checkOut), "yyyy-MM-dd")}
      </div>
    </div>
  );
}
