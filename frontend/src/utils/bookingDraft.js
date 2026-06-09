const BOOKING_DRAFT_KEY = "bookingTourPaymentDraft";

export const saveBookingDraft = (draft) => {
  sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
};

export const getBookingDraft = () => {
  try {
    const rawDraft = sessionStorage.getItem(BOOKING_DRAFT_KEY);
    return rawDraft ? JSON.parse(rawDraft) : null;
  } catch {
    return null;
  }
};

export const clearBookingDraft = () => {
  sessionStorage.removeItem(BOOKING_DRAFT_KEY);
};
