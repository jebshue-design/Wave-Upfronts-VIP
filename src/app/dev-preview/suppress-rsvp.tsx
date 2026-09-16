"use client";
import { useEffect } from "react";
export default function SuppressRsvp() {
  useEffect(() => { try { sessionStorage.setItem("rsvp-shown", "1"); } catch {} }, []);
  return null;
}
