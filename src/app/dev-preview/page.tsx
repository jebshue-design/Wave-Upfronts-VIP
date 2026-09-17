import { notFound } from "next/navigation";
import { shows } from "../page";
import SlateCarousel from "../components/SlateCarousel";
import SuppressRsvp from "./suppress-rsvp";

export default function DevPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  const fakeUser = { firstName: "Dev", lastName: "Preview", email: "dev@wave.tv", company: "Wave", title: "Preview" };
  return (
    <>
      <SuppressRsvp />
      <SlateCarousel shows={[...shows].sort((a, b) => Number(b.id === "ngl") - Number(a.id === "ngl"))} user={fakeUser} />
    </>
  );
}
