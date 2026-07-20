import { uid, isoDate, daysAgo } from "./helpers";

export function seedClients() {
  return [
    {
      id: uid(), name: "Maya Torres", company: "Bloom & Co Florals", website: "bloomandco.com",
      industry: "Retail / E-commerce", email: "maya@bloomandco.com", phone: "+1 555 201 3345",
      whatsapp: "+1 555 201 3345", linkedin: "linkedin.com/in/mayatorres", address: "Austin, TX",
      notes: "Wants a Shopify redesign before the holiday season. Mentioned budget is flexible if we can show a quick mockup.",
      tags: ["warm lead", "ecommerce"], leadSource: "Instagram DM", dealValue: 4200, priority: "High",
      stage: "Follow-Up", lastContactDate: daysAgo(9), nextFollowUpDate: daysAgo(-1),
      activityLog: [
        { id: uid(), date: daysAgo(14), type: "Email", note: "Sent intro email after she liked our portfolio post." },
        { id: uid(), date: daysAgo(9), type: "Call", note: "15 min call, she's interested but wants to see pricing." },
      ],
      aiInsight: "", createdAt: daysAgo(14),
    },
    {
      id: uid(), name: "Devon Wallace", company: "Wallace Legal Group", website: "wallacelegal.com",
      industry: "Legal Services", email: "devon@wallacelegal.com", phone: "+1 555 442 8890",
      whatsapp: "", linkedin: "linkedin.com/in/devonwallace", address: "Chicago, IL",
      notes: "Needs a client intake automation. Slow to respond — likely juggling a trial.",
      tags: ["cold", "referral"], leadSource: "Referral - James K.", dealValue: 7800, priority: "Medium",
      stage: "Contacted", lastContactDate: daysAgo(22), nextFollowUpDate: daysAgo(3),
      activityLog: [
        { id: uid(), date: daysAgo(22), type: "Email", note: "Sent proposal outline, no reply yet." },
      ],
      aiInsight: "", createdAt: daysAgo(30),
    },
    {
      id: uid(), name: "Priya Nandakumar", company: "Nandakumar Wellness", website: "nandakumarwellness.com",
      industry: "Health & Wellness", email: "priya@ndkwellness.com", phone: "+1 555 671 0192",
      whatsapp: "+1 555 671 0192", linkedin: "", address: "San Diego, CA",
      notes: "Booked a discovery call for next week. Very responsive, high intent.",
      tags: ["hot", "booked"], leadSource: "Website form", dealValue: 2600, priority: "High",
      stage: "Proposal Sent", lastContactDate: daysAgo(1), nextFollowUpDate: daysAgo(-3),
      activityLog: [
        { id: uid(), date: daysAgo(5), type: "WhatsApp", note: "Quick chat about scope." },
        { id: uid(), date: daysAgo(1), type: "Meeting", note: "Discovery call — sending proposal this week." },
      ],
      aiInsight: "", createdAt: daysAgo(6),
    },
    {
      id: uid(), name: "Tomas Berg", company: "Berg Structural Engineering", website: "bergstructural.com",
      industry: "Construction / Engineering", email: "tomas@bergstructural.com", phone: "+1 555 903 4471",
      whatsapp: "", linkedin: "linkedin.com/in/tomasberg", address: "Denver, CO",
      notes: "Went quiet after initial outreach. Worth one more nudge before archiving.",
      tags: ["stale"], leadSource: "Cold email", dealValue: 3100, priority: "Low",
      stage: "New Lead", lastContactDate: daysAgo(26), nextFollowUpDate: "",
      activityLog: [
        { id: uid(), date: daysAgo(26), type: "Email", note: "First cold outreach email, no response." },
      ],
      aiInsight: "", createdAt: daysAgo(26),
    },
    {
      id: uid(), name: "Sasha Kim", company: "Kim & Rivers Studio", website: "kimriversstudio.com",
      industry: "Design Agency", email: "sasha@kimrivers.co", phone: "+1 555 118 6602",
      whatsapp: "+1 555 118 6602", linkedin: "linkedin.com/in/sashakim", address: "Brooklyn, NY",
      notes: "Closed! Signed the retainer agreement. Onboarding scheduled.",
      tags: ["client", "retainer"], leadSource: "LinkedIn outreach", dealValue: 5400, priority: "Medium",
      stage: "Won", lastContactDate: daysAgo(2), nextFollowUpDate: "",
      activityLog: [
        { id: uid(), date: daysAgo(20), type: "LinkedIn", note: "Connected and started conversation." },
        { id: uid(), date: daysAgo(2), type: "Email", note: "Signed contract, kicking off next month." },
      ],
      aiInsight: "", createdAt: daysAgo(25),
    },
  ];
}
