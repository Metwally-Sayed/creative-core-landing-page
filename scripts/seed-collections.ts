import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function main() {
  // --- Locations ---
  const { count: locCount } = await supabase
    .from("locations")
    .select("*", { count: "exact", head: true });

  if (locCount && locCount > 0) {
    console.log("locations: already seeded, skipping.");
  } else {
    const { error } = await supabase.from("locations").insert([
      {
        name: "New York",
        country: "United States",
        address_lines: [
          "36 East 20th St, 6th Floor",
          "New York, NY 10003",
          "Tel: +1 917 818-4282",
        ],
        email: "hello@hellomonday.com",
        map_url:
          "https://www.google.com/maps/place/Hello+Monday/@40.7385487,-73.9908801,17z",
        sort_order: 0,
      },
      {
        name: "Copenhagen",
        country: "Denmark",
        address_lines: [
          "Langebrogade 6E, 2nd floor",
          "1411 Copenhagen",
          "Tel: +45 3145 6035",
        ],
        email: "hello@hellomonday.com",
        map_url:
          "https://www.google.com/maps/place/Hello+Monday/@55.6658995,12.5783361,17z",
        sort_order: 1,
      },
      {
        name: "Aarhus",
        country: "Denmark",
        address_lines: [
          "Banegardspladsen 20A, 1.TV",
          "8000 Aarhus C",
          "Tel: +45 6015 4515",
        ],
        email: "hello@hellomonday.com",
        map_url:
          "https://www.google.com/maps/place/Hello+Monday/@56.1500968,10.2030539,17z",
        sort_order: 2,
      },
      {
        name: "Amsterdam",
        country: "Netherlands",
        address_lines: [
          "Generaal Vetterstraat 66",
          "1059 BW Amsterdam",
          "Netherlands",
        ],
        email: "hello@hellomonday.com",
        map_url:
          "https://www.google.com/maps/place/Generaal+Vetterstraat+66,+1059+BW+Amsterdam,+Netherlands",
        sort_order: 3,
      },
    ]);
    if (error) throw error;
    console.log("locations: seeded 4 rows.");
  }

  // --- FAQ items ---
  const { count: faqCount } = await supabase
    .from("faq_items")
    .select("*", { count: "exact", head: true });

  if (faqCount && faqCount > 0) {
    console.log("faq_items: already seeded, skipping.");
  } else {
    const { error } = await supabase.from("faq_items").insert([
      {
        question: "What does a typical engagement look like?",
        answer:
          "Most projects begin with a focused discovery sprint, then move into strategy, design, and implementation. We align around checkpoints early so the handoff is clear and launch-ready.",
        preview: "A short discovery sprint, then production with clear review cadence.",
        deliverables: ["Discovery Notes", "Roadmap", "Weekly Review Rhythm"],
        sort_order: 0,
      },
      {
        question: "Do you work with product teams as well as brands?",
        answer:
          "Yes. We support product organizations, marketing teams, and brand leads. The shape of the project changes, but the core collaboration model stays the same.",
        preview: "The process adapts to both product organizations and brand teams.",
        deliverables: ["UX Direction", "Launch System"],
        sort_order: 1,
      },
      {
        question: "Can you take on a focused scope instead of a full redesign?",
        answer:
          "Absolutely. We can quote single-scope projects like a launch page, design system work, or a campaign experience while keeping room to expand later.",
        preview: "Focused scopes are fine as long as the output is clearly defined.",
        deliverables: ["Scope Plan", "Execution Milestones"],
        sort_order: 2,
      },
      {
        question: "How do you price projects?",
        answer:
          "We quote by scope and outcomes, not hourly tracking. Once we understand goals, timeline, and deliverables, we can put together a tighter project estimate.",
        preview: "Outcome-based pricing with a clearer estimate after discovery.",
        deliverables: ["Proposal", "Milestone Estimate"],
        sort_order: 3,
      },
      {
        question: "How quickly can a project start?",
        answer:
          "Smaller scopes can usually start quickly. Larger programs may need a short lead-in for discovery, content collection, or technical planning.",
        preview: "Fast-start for focused work, short runway for broader programs.",
        deliverables: ["Availability Window", "Kickoff Plan"],
        sort_order: 4,
      },
    ]);
    if (error) throw error;
    console.log("faq_items: seeded 5 rows.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
