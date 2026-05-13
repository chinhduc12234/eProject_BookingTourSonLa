import { useCallback, useEffect, useState } from "react";
import { readJSON, writeJSON, STORAGE_KEYS } from "../utils/storage";

export function useBookings() {
    const [bookings, setBookings] = useState(() => readJSON(STORAGE_KEYS.bookings, []));

    useEffect(() => {
        writeJSON(STORAGE_KEYS.bookings, bookings);
    }, [bookings]);

    const addBooking = useCallback((booking) => {
        setBookings((current) => [{ ...booking, createdAt: new Date().toISOString() }, ...current]);
    }, []);

    const cancelBooking = useCallback((code) => {
        setBookings((current) =>
            current.map((b) => (b.bookingCode === code ? { ...b, status: "CANCELLED" } : b)),
        );
    }, []);

    const findBooking = useCallback(
        (code) => bookings.find((b) => b.bookingCode === code),
        [bookings],
    );

    return { bookings, addBooking, cancelBooking, findBooking };
}
