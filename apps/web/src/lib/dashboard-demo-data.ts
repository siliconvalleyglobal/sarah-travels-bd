/** Demo analytics for client-facing enterprise dashboards */

export const CHART_COLORS = {
  navy: "#02132f",
  gold: "#d4af37",
  blue: "#3b82f6",
  teal: "#14b8a6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  slate: "#94a3b8",
} as const;

export const adminDemo = {
  kpis: [
    { label: "Total Revenue", value: "৳ 4.82 Cr", change: "+18.4%", trend: "up" as const, sub: "vs last quarter" },
    { label: "Bookings", value: "2,847", change: "+12.1%", trend: "up" as const, sub: "MTD confirmed" },
    { label: "Active Agents", value: "156", change: "+8", trend: "up" as const, sub: "ATAB registered" },
    { label: "Customers", value: "12,430", change: "+24.6%", trend: "up" as const, sub: "registered accounts" },
    { label: "AIT Collected", value: "৳ 1.42 L", change: "0.3%", trend: "neutral" as const, sub: "NBR auto-filing" },
    { label: "VAT Generated", value: "৳ 8.65 L", change: "+9.2%", trend: "up" as const, sub: "service fee only" },
  ],
  revenueTrend: [
    { month: "Jul", revenue: 28.4, bookings: 198 },
    { month: "Aug", revenue: 32.1, bookings: 224 },
    { month: "Sep", revenue: 35.8, bookings: 251 },
    { month: "Oct", revenue: 41.2, bookings: 289 },
    { month: "Nov", revenue: 38.6, bookings: 267 },
    { month: "Dec", revenue: 52.4, bookings: 342 },
    { month: "Jan", revenue: 48.9, bookings: 318 },
    { month: "Feb", revenue: 55.3, bookings: 356 },
    { month: "Mar", revenue: 61.7, bookings: 401 },
    { month: "Apr", revenue: 58.2, bookings: 378 },
    { month: "May", revenue: 64.8, bookings: 425 },
    { month: "Jun", revenue: 72.1, bookings: 468 },
  ],
  bookingsByType: [
    { name: "Flights", value: 42, color: CHART_COLORS.navy },
    { name: "Hotels", value: 28, color: CHART_COLORS.blue },
    { name: "Umrah", value: 18, color: CHART_COLORS.gold },
    { name: "Visa", value: 8, color: CHART_COLORS.teal },
    { name: "Tours", value: 4, color: CHART_COLORS.amber },
  ],
  topAgents: [
    { name: "Demo Travel Agency", code: "AGDEMO1", bookings: 142, revenue: "৳ 28.4 L", growth: "+22%" },
    { name: "Dhaka Express Tours", code: "AGDX02", bookings: 98, revenue: "৳ 19.1 L", growth: "+15%" },
    { name: "Chittagong Hajj Center", code: "AGCTG3", bookings: 87, revenue: "৳ 16.8 L", growth: "+11%" },
    { name: "Sylhet Umrah House", code: "AGSYL4", bookings: 64, revenue: "৳ 12.2 L", growth: "+8%" },
    { name: "Bashundhara Travel", code: "AGBSH5", bookings: 51, revenue: "৳ 9.8 L", growth: "+6%" },
  ],
  recentBookings: [
    { ref: "STB-2026-8841", customer: "Jamil Khan", type: "FLIGHT", route: "DAC → JED", amount: "৳ 68,500", status: "TICKETED", time: "12 min ago" },
    { ref: "STB-2026-8840", customer: "Salma Begum", type: "UMRAH", route: "Standard 10D", amount: "৳ 145,000", status: "CONFIRMED", time: "34 min ago" },
    { ref: "STB-2026-8839", customer: "Rahim Miah", type: "HOTEL", route: "Mecca · 5 nights", amount: "৳ 142,500", status: "CONFIRMED", time: "1 hr ago" },
    { ref: "STB-2026-8838", customer: "Nusrat Islam", type: "VISA", route: "UAE Tourist", amount: "৳ 8,500", status: "PROCESSING", time: "2 hr ago" },
    { ref: "STB-2026-8837", customer: "Karim Hossain", type: "FLIGHT", route: "DAC → DXB", amount: "৳ 52,000", status: "PENDING_PAYMENT", time: "3 hr ago" },
  ],
  activity: [
    { action: "Agent AGDX02 approved", user: "Admin User", time: "10:42 AM" },
    { action: "Mushak 6.3 generated for STB-8841", user: "System", time: "10:38 AM" },
    { action: "Supplier Ratehawk sync completed", user: "System", time: "09:15 AM" },
    { action: "New agent registration: AGKHL6", user: "Khulna Tours", time: "08:55 AM" },
    { action: "AIT 0.3% filed to NBR portal", user: "System", time: "08:00 AM" },
  ],
  compliance: { vatRate: "15%", aitRate: "0.3%", mushakGenerated: 2847, nbrStatus: "Compliant" },
};

export const agentDemo = {
  kpis: [
    { label: "Credit Available", value: "৳ 4.35 L", change: "of ৳ 5 L limit", trend: "neutral" as const, sub: "87% remaining" },
    { label: "Commission MTD", value: "৳ 42,800", change: "+16.2%", trend: "up" as const, sub: "5% avg rate" },
    { label: "Bookings MTD", value: "47", change: "+9", trend: "up" as const, sub: "vs last month" },
    { label: "Conversion Rate", value: "68%", change: "+4.2%", trend: "up" as const, sub: "quotes → paid" },
  ],
  bookingTrend: [
    { week: "W1", flights: 8, hotels: 4, umrah: 2 },
    { week: "W2", flights: 11, hotels: 5, umrah: 3 },
    { week: "W3", flights: 9, hotels: 6, umrah: 1 },
    { week: "W4", flights: 14, hotels: 7, umrah: 4 },
    { week: "W5", flights: 12, hotels: 5, umrah: 2 },
    { week: "W6", flights: 16, hotels: 8, umrah: 5 },
  ],
  revenueMix: [
    { name: "Flights", value: 58, color: CHART_COLORS.navy },
    { name: "Umrah", value: 28, color: CHART_COLORS.gold },
    { name: "Hotels", value: 10, color: CHART_COLORS.blue },
    { name: "Visa", value: 4, color: CHART_COLORS.teal },
  ],
  commissionTrend: [
    { month: "Jan", commission: 28.4 },
    { month: "Feb", commission: 31.2 },
    { month: "Mar", commission: 35.8 },
    { month: "Apr", commission: 33.1 },
    { month: "May", commission: 38.6 },
    { month: "Jun", commission: 42.8 },
  ],
  recentBookings: [
    { ref: "STB-AG-4412", customer: "Abdul Karim", type: "FLIGHT", amount: "৳ 72,400", status: "TICKETED", date: "Today" },
    { ref: "STB-AG-4411", customer: "Fatima Sultana", type: "UMRAH", amount: "৳ 95,000", status: "CONFIRMED", date: "Yesterday" },
    { ref: "STB-AG-4410", customer: "Imran Ali", type: "HOTEL", amount: "৳ 28,500", status: "CONFIRMED", date: "Jun 4" },
    { ref: "STB-AG-4409", customer: "Sadia Rahman", type: "VISA", amount: "৳ 12,000", status: "PROCESSING", date: "Jun 3" },
  ],
  tasks: [
    { title: "Follow up payment STB-AG-4408", priority: "high", due: "Today" },
    { title: "Upload group passport copies", priority: "medium", due: "Tomorrow" },
    { title: "Confirm Umrah hotel allocation", priority: "medium", due: "Jun 8" },
  ],
};

export const clientDemo = {
  kpis: [
    { label: "Total Trips", value: "12", change: "+2 this year", trend: "up" as const, sub: "all time" },
    { label: "Upcoming", value: "2", change: "Next: Jun 18", trend: "neutral" as const, sub: "confirmed trips" },
    { label: "Spent YTD", value: "৳ 3.24 L", change: "+৳ 68k", trend: "up" as const, sub: "incl. service fees" },
    { label: "Sarah Points", value: "1,840", change: "+120", trend: "up" as const, sub: "loyalty rewards" },
  ],
  spendingByCategory: [
    { name: "Flights", value: 45, color: CHART_COLORS.navy },
    { name: "Umrah", value: 30, color: CHART_COLORS.gold },
    { name: "Hotels", value: 18, color: CHART_COLORS.blue },
    { name: "Visa", value: 7, color: CHART_COLORS.teal },
  ],
  spendingTrend: [
    { month: "Jan", amount: 18.2 },
    { month: "Feb", amount: 0 },
    { month: "Mar", amount: 42.5 },
    { month: "Apr", amount: 12.8 },
    { month: "May", amount: 68.4 },
    { month: "Jun", amount: 24.1 },
  ],
  upcomingTrips: [
    { title: "Dhaka → Jeddah", type: "FLIGHT", date: "Jun 18, 2026", status: "CONFIRMED", ref: "STB-2026-7721" },
    { title: "Fairmont Makkah", type: "HOTEL", date: "Jun 18–23, 2026", status: "CONFIRMED", ref: "STB-2026-7722" },
  ],
  recentActivity: [
    { action: "E-ticket issued for DAC → JED", time: "2 days ago", icon: "flight" },
    { action: "Hotel confirmation received", time: "2 days ago", icon: "hotel" },
    { action: "Visa application submitted (UAE)", time: "1 week ago", icon: "visa" },
    { action: "Payment received via bKash", time: "2 weeks ago", icon: "payment" },
  ],
  quickStats: { savedWithDeals: "৳ 14,200", carbonOffset: "2.4t", supportTickets: 0 },
};
