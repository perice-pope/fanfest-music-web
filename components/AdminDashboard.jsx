"use client";

import { useState, useMemo, useCallback, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   DEMO DATA GENERATION
   ═══════════════════════════════════════════════════════════════════════════ */

const FIRST_NAMES_F = ["Aaliyah","Brianna","Camila","Destiny","Elena","Fatima","Grace","Harper","Isabelle","Jade","Keisha","Luna","Maya","Naomi","Olivia"];
const FIRST_NAMES_M = ["Andre","Brandon","Carlos","DeShawn","Elijah","Felix","Gavin","Hassan","Isaiah","Jamal","Kai","Liam","Marcus","Noah","Oscar"];
const FIRST_NAMES_NB = ["Avery","Bailey","Casey","Drew","Ellis","Frankie","Gray","Hayden","Indigo","Jordan","Kit","Lane","Morgan","Nico","Parker"];
const FIRST_NAMES_T = ["Alex","Blake","Cameron","Dakota","Eden","Finley","Harper","Jamie","Kendall","Logan","Milan","Quinn","River","Sage","Taylor"];
const LAST_NAMES = ["Williams","Johnson","Brown","Garcia","Martinez","Davis","Rodriguez","Anderson","Thomas","Jackson","Lee","Harris","Clark","Lewis","Robinson","Walker","Hall","Young","King","Wright","Lopez","Hill","Scott","Green","Adams","Baker","Nelson","Carter","Mitchell","Perez"];

const STATES = ["CA","NY","TX","FL","IL","PA","OH","GA","NC","MI"];
const CITIES_BY_STATE = {
  CA: ["Los Angeles","San Francisco","San Diego"],
  NY: ["New York","Brooklyn","Buffalo"],
  TX: ["Houston","Austin","Dallas"],
  FL: ["Miami","Orlando","Tampa"],
  IL: ["Chicago","Springfield","Naperville"],
  PA: ["Philadelphia","Pittsburgh","Allentown"],
  OH: ["Columbus","Cleveland","Cincinnati"],
  GA: ["Atlanta","Savannah","Augusta"],
  NC: ["Charlotte","Raleigh","Durham"],
  MI: ["Detroit","Grand Rapids","Ann Arbor"],
};
const ZIPS_BY_STATE = {
  CA: ["90001","94102","92101"],
  NY: ["10001","11201","14201"],
  TX: ["77001","73301","75201"],
  FL: ["33101","32801","33601"],
  IL: ["60601","62701","60540"],
  PA: ["19101","15201","18101"],
  OH: ["43201","44101","45201"],
  GA: ["30301","31401","30901"],
  NC: ["28201","27601","27701"],
  MI: ["48201","49501","48104"],
};

const BEHAVIORS_LIST = ["spotifyPlay","createdFanClub","joinedFanClub","uploadedCover","attendedShow"];
const BEHAVIOR_LABELS = {
  spotifyPlay: "Spotify Play",
  createdFanClub: "Created a Fan Club",
  joinedFanClub: "Joined a Fan Club",
  uploadedCover: "Uploaded a Cover",
  attendedShow: "Attended a Show",
};

const AGE_RANGES = ["13-17","18-24","25-34","35-44","45+"];
const GENDERS = ["Male","Female","Non-Binary","Trans"];
const GENDER_CODES = { Male: "M", Female: "W", "Non-Binary": "NB", Trans: "T" };
const GENDER_COLORS = {
  Male: "bg-blue-500",
  Female: "bg-pink-400",
  "Non-Binary": "bg-purple-500",
  Trans: "bg-teal-500",
};

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateUsers(count = 36) {
  const rand = seededRandom(42);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const users = [];

  for (let i = 0; i < count; i++) {
    const gender = pick(GENDERS);
    let firstName;
    if (gender === "Male") firstName = pick(FIRST_NAMES_M);
    else if (gender === "Female") firstName = pick(FIRST_NAMES_F);
    else if (gender === "Non-Binary") firstName = pick(FIRST_NAMES_NB);
    else firstName = pick(FIRST_NAMES_T);

    const lastName = pick(LAST_NAMES);
    const state = pick(STATES);
    const city = pick(CITIES_BY_STATE[state]);
    const zip = pick(ZIPS_BY_STATE[state]);
    const birthYear = 1960 + Math.floor(rand() * 55);
    const birthMonth = 1 + Math.floor(rand() * 12);
    const birthDay = 1 + Math.floor(rand() * 28);
    const age = 2026 - birthYear;
    let ageRange;
    if (age < 18) ageRange = "13-17";
    else if (age < 25) ageRange = "18-24";
    else if (age < 35) ageRange = "25-34";
    else if (age < 45) ageRange = "35-44";
    else ageRange = "45+";

    const joinYear = 2023 + Math.floor(rand() * 3);
    const joinMonth = 1 + Math.floor(rand() * 12);
    const joinDay = 1 + Math.floor(rand() * 28);

    const behaviors = BEHAVIORS_LIST.filter(() => rand() > 0.45);
    if (behaviors.length === 0) behaviors.push(pick(BEHAVIORS_LIST));

    const paid = rand() > 0.34;
    const phone = `(${String(200 + Math.floor(rand() * 800)).padStart(3, "0")}) ${String(100 + Math.floor(rand() * 900)).padStart(3, "0")}-${String(1000 + Math.floor(rand() * 9000))}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(rand() * 99)}@${pick(["gmail.com","yahoo.com","outlook.com","icloud.com","hotmail.com"])}`;

    users.push({
      id: i + 1,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      phone,
      gender,
      genderCode: GENDER_CODES[gender],
      genderColor: GENDER_COLORS[gender],
      ageRange,
      birthday: `${String(birthMonth).padStart(2, "0")}/${String(birthDay).padStart(2, "0")}/${birthYear}`,
      dateJoined: `${String(joinMonth).padStart(2, "0")}/${String(joinDay).padStart(2, "0")}/${joinYear}`,
      state,
      city,
      zip,
      country: "US",
      behaviors,
      paid,
      spend: paid ? Math.round((15 + rand() * 135) * 100) / 100 : 0,
    });
  }
  return users;
}

const ALL_USERS = generateUsers(36);

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════════════════════════ */

function Toast({ message, visible, onClose }) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onClose, 2500);
      return () => clearTimeout(t);
    }
  }, [visible, onClose]);

  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="card px-5 py-3 flex items-center gap-3 shadow-card-lg border-brand/30">
        <svg className="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FILTERS SIDEBAR
   ═══════════════════════════════════════════════════════════════════════════ */

function CheckboxGroup({ label, options, selected, onChange }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{label}</div>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => {
                onChange(
                  selected.includes(opt)
                    ? selected.filter((s) => s !== opt)
                    : [...selected, opt]
                );
              }}
              className="h-4 w-4 rounded border-border text-brand focus:ring-brand/30 accent-brand cursor-pointer"
            />
            <span className="text-sm text-text group-hover:text-brand transition-colors">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function FiltersSidebar({
  filters,
  onFilterChange,
  onApply,
  onReset,
  onSave,
  isApplying,
  mobileOpen,
  onMobileClose,
}) {
  const updateFilter = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-lg">Filters</h2>
        <button className="md:hidden btn-ghost p-1.5 rounded-lg" onClick={onMobileClose}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pr-1 -mr-1">
        {/* Date Range */}
        <div>
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Date Range</div>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter("startDate", e.target.value)}
              className="input text-xs"
              placeholder="Start date"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter("endDate", e.target.value)}
              className="input text-xs"
              placeholder="End date"
            />
          </div>
        </div>

        {/* Age */}
        <CheckboxGroup
          label="Age"
          options={AGE_RANGES}
          selected={filters.ages}
          onChange={(v) => updateFilter("ages", v)}
        />

        {/* Gender */}
        <CheckboxGroup
          label="Gender"
          options={GENDERS}
          selected={filters.genders}
          onChange={(v) => updateFilter("genders", v)}
        />

        {/* Location */}
        <div>
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Location</div>
          <label className="flex items-center gap-2 cursor-pointer group mb-2">
            <input
              type="checkbox"
              checked={filters.locationCountry}
              onChange={() => updateFilter("locationCountry", !filters.locationCountry)}
              className="h-4 w-4 rounded border-border text-brand focus:ring-brand/30 accent-brand cursor-pointer"
            />
            <span className="text-sm text-text group-hover:text-brand transition-colors">Country (US)</span>
          </label>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {STATES.map((st) => (
              <label key={st} className="flex items-center gap-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.states.includes(st)}
                  onChange={() =>
                    updateFilter(
                      "states",
                      filters.states.includes(st)
                        ? filters.states.filter((s) => s !== st)
                        : [...filters.states, st]
                    )
                  }
                  className="h-3.5 w-3.5 rounded border-border text-brand focus:ring-brand/30 accent-brand cursor-pointer"
                />
                <span className="text-xs text-text group-hover:text-brand transition-colors">{st}</span>
              </label>
            ))}
          </div>
          <input
            type="text"
            value={filters.zipSearch}
            onChange={(e) => updateFilter("zipSearch", e.target.value)}
            className="input text-xs mt-2"
            placeholder="Search zip code..."
          />
        </div>

        {/* Fan Behavior */}
        <CheckboxGroup
          label="Fan Behavior"
          options={Object.values(BEHAVIOR_LABELS)}
          selected={filters.behaviors}
          onChange={(v) => updateFilter("behaviors", v)}
        />

        {/* Membership Tier */}
        <CheckboxGroup
          label="Membership Tier"
          options={["Paid", "Unpaid"]}
          selected={filters.membership}
          onChange={(v) => updateFilter("membership", v)}
        />
      </div>

      {/* Bottom buttons */}
      <div className="flex gap-2 pt-4 mt-4 border-t border-border/60">
        <button
          onClick={onApply}
          disabled={isApplying}
          className="btn-primary flex-1 text-xs py-2"
        >
          {isApplying ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Applying...
            </span>
          ) : (
            "Apply Filters"
          )}
        </button>
        <button onClick={onReset} className="btn-secondary flex-1 text-xs py-2">
          Reset
        </button>
        <button onClick={onSave} className="btn-secondary text-xs py-2 px-3">
          Save
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-[280px] shrink-0 bg-surface border border-border/60 rounded-2xl shadow-card p-5 h-fit max-h-[calc(100vh-120px)] sticky top-20 flex flex-col">
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-[320px] max-w-[85vw] bg-surface shadow-card-lg p-5 overflow-y-auto animate-fade-in">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUMMARY CARDS
   ═══════════════════════════════════════════════════════════════════════════ */

function SummaryCards({ users }) {
  const totalFans = users.length;
  const experiencesPurchased = users.filter((u) => u.paid).length > 0
    ? users.reduce((sum, u) => sum + (u.paid ? Math.ceil(u.spend / 10) : 0), 0)
    : 0;
  const avgSpend =
    users.length > 0
      ? (users.reduce((sum, u) => sum + u.spend, 0) / users.length).toFixed(2)
      : "0.00";
  const pctPaid =
    users.length > 0
      ? Math.round((users.filter((u) => u.paid).length / users.length) * 100)
      : 0;

  const cards = [
    { label: "Total Fans", value: totalFans.toLocaleString(), icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
    )},
    { label: "Experiences Purchased", value: experiencesPurchased.toLocaleString(), icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" /></svg>
    )},
    { label: "Avg Spend Per Fan", value: `$${avgSpend}`, icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
    )},
    { label: "% Paid Members", value: `${pctPaid}%`, icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
    )},
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-brand/60">{c.icon}</div>
            <div className="text-xs font-medium text-muted">{c.label}</div>
          </div>
          <div className="font-display text-2xl font-bold">{c.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BEHAVIOR CHART (stat bars + donut)
   ═══════════════════════════════════════════════════════════════════════════ */

const BEHAVIOR_COLORS = {
  spotifyPlay: "#7C3AED",
  createdFanClub: "#6D28D9",
  joinedFanClub: "#8B5CF6",
  uploadedCover: "#F59E0B",
  attendedShow: "#A78BFA",
};

const BEHAVIOR_RING_COLORS = {
  spotifyPlay: "#7C3AED",
  createdFanClub: "#5B21B6",
  joinedFanClub: "#8B5CF6",
  uploadedCover: "#F59E0B",
  attendedShow: "#C4B5FD",
};

function BehaviorChart({ users }) {
  const [hoveredBehavior, setHoveredBehavior] = useState(null);

  const behaviorCounts = useMemo(() => {
    const counts = {};
    BEHAVIORS_LIST.forEach((b) => {
      counts[b] = users.filter((u) => u.behaviors.includes(b)).length;
    });
    return counts;
  }, [users]);

  const total = Object.values(behaviorCounts).reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...Object.values(behaviorCounts), 1);

  // Donut chart SVG params
  const radius = 90;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  const segments = BEHAVIORS_LIST.map((b) => {
    const pct = total > 0 ? behaviorCounts[b] / total : 0;
    const dashLength = pct * circumference;
    const gapLength = circumference - dashLength;
    const rotation = (cumulativeOffset / total) * 360;
    cumulativeOffset += behaviorCounts[b];
    return { key: b, dashLength, gapLength, rotation, pct, count: behaviorCounts[b] };
  });

  return (
    <div className="card p-5">
      <h3 className="font-display font-semibold mb-5">Fan Behavior</h3>
      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Stat bars */}
        <div className="space-y-3">
          {BEHAVIORS_LIST.map((b) => {
            const count = behaviorCounts[b];
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const isHovered = hoveredBehavior === b;
            return (
              <div
                key={b}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredBehavior(b)}
                onMouseLeave={() => setHoveredBehavior(null)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium transition-colors ${isHovered ? "text-brand" : "text-text"}`}>
                    {BEHAVIOR_LABELS[b]}
                  </span>
                  <span className={`text-sm font-bold tabular-nums transition-colors ${isHovered ? "text-brand" : "text-muted"}`}>
                    {count}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-surface2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: BEHAVIOR_COLORS[b],
                      opacity: hoveredBehavior && !isHovered ? 0.4 : 1,
                      transform: isHovered ? "scaleY(1.15)" : "scaleY(1)",
                      transformOrigin: "center",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Donut chart */}
        <div className="flex justify-center">
          <div className="relative">
            <svg width="240" height="240" viewBox="0 0 240 240" className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="120" cy="120" r={radius}
                fill="none"
                stroke="#F3EEFF"
                strokeWidth={strokeWidth}
              />
              {/* Segments */}
              {segments.map((seg) => (
                <circle
                  key={seg.key}
                  cx="120" cy="120" r={radius}
                  fill="none"
                  stroke={BEHAVIOR_RING_COLORS[seg.key]}
                  strokeWidth={hoveredBehavior === seg.key ? strokeWidth + 6 : strokeWidth}
                  strokeDasharray={`${seg.dashLength} ${seg.gapLength}`}
                  transform={`rotate(${seg.rotation} 120 120)`}
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    opacity: hoveredBehavior && hoveredBehavior !== seg.key ? 0.35 : 1,
                  }}
                  onMouseEnter={() => setHoveredBehavior(seg.key)}
                  onMouseLeave={() => setHoveredBehavior(null)}
                />
              ))}
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {hoveredBehavior ? (
                <>
                  <div className="font-display text-xl font-bold">{behaviorCounts[hoveredBehavior]}</div>
                  <div className="text-xs text-muted text-center px-4 leading-tight">{BEHAVIOR_LABELS[hoveredBehavior]}</div>
                </>
              ) : (
                <>
                  <div className="font-display text-2xl font-bold">{total.toLocaleString()}</div>
                  <div className="text-xs text-muted">Total Fan Behavior</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   USER INFO TABLE
   ═══════════════════════════════════════════════════════════════════════════ */

function UserTable({ users }) {
  const [page, setPage] = useState(1);
  const perPage = 12;
  const totalPages = Math.max(1, Math.ceil(users.length / perPage));
  const currentPage = Math.min(page, totalPages);

  // Reset to page 1 when users change
  useEffect(() => {
    setPage(1);
  }, [users]);

  const visibleUsers = users.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <h3 className="font-display font-semibold">User Info</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand/20 px-2.5 py-0.5 text-[10px] font-medium text-brand">
            This section is always present.
          </span>
        </div>
        <div className="text-xs text-muted">{users.length} users</div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-border/60 bg-surface2/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Avatar</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Full Name</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Email</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Phone</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Birthday</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Date Joined</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted text-sm">
                  No users match the selected filters.
                </td>
              </tr>
            ) : (
              visibleUsers.map((u) => (
                <tr key={u.id} className="border-b border-border/30 hover:bg-surface2/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className={`h-9 w-9 rounded-full overflow-hidden ring-2 ${u.genderColor.replace("bg-", "ring-")}/40`}>
                      <img src={`https://i.pravatar.cc/72?u=${u.id}`} alt={u.fullName} className="h-full w-full object-cover" />
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium whitespace-nowrap">{u.fullName}</td>
                  <td className="px-3 py-3 text-muted hidden sm:table-cell whitespace-nowrap">{u.email}</td>
                  <td className="px-3 py-3 text-muted hidden lg:table-cell whitespace-nowrap">{u.phone}</td>
                  <td className="px-3 py-3 text-muted hidden md:table-cell whitespace-nowrap">{u.birthday}</td>
                  <td className="px-3 py-3 text-muted hidden md:table-cell whitespace-nowrap">{u.dateJoined}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border/60">
        <div className="text-xs text-muted">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn-ghost p-1.5 rounded-lg disabled:opacity-30 disabled:pointer-events-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              if (totalPages <= 5) return true;
              if (p === 1 || p === totalPages) return true;
              return Math.abs(p - currentPage) <= 1;
            })
            .map((p, idx, arr) => {
              const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
              return (
                <span key={p} className="flex items-center">
                  {showEllipsis && <span className="px-1 text-muted text-xs">...</span>}
                  <button
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                      p === currentPage
                        ? "bg-brand text-white"
                        : "text-muted hover:bg-surface2 hover:text-brand"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              );
            })}
          <button
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn-ghost p-1.5 rounded-lg disabled:opacity-30 disabled:pointer-events-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHIMMER OVERLAY
   ═══════════════════════════════════════════════════════════════════════════ */

function ShimmerOverlay() {
  return (
    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-2xl backdrop-blur-[1px]">
      <div className="flex items-center gap-2 text-brand">
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-medium">Applying filters...</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_FILTERS = {
  startDate: "",
  endDate: "",
  ages: [],
  genders: [],
  locationCountry: false,
  states: [],
  zipSearch: "",
  behaviors: [],
  membership: [],
};

export default function AdminDashboard({ userName }) {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [appliedFilters, setAppliedFilters] = useState({ ...DEFAULT_FILTERS });
  const [isApplying, setIsApplying] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setToastVisible(true);
  }, []);

  const filteredUsers = useMemo(() => {
    return ALL_USERS.filter((u) => {
      const f = appliedFilters;

      // Date range filter - filter by dateJoined
      if (f.startDate) {
        const parts = u.dateJoined.split("/");
        const joined = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
        const start = new Date(f.startDate);
        if (joined < start) return false;
      }
      if (f.endDate) {
        const parts = u.dateJoined.split("/");
        const joined = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
        const end = new Date(f.endDate);
        if (joined > end) return false;
      }

      // Age
      if (f.ages.length > 0 && !f.ages.includes(u.ageRange)) return false;

      // Gender
      if (f.genders.length > 0 && !f.genders.includes(u.gender)) return false;

      // States
      if (f.states.length > 0 && !f.states.includes(u.state)) return false;

      // Zip
      if (f.zipSearch && !u.zip.includes(f.zipSearch)) return false;

      // Behaviors
      if (f.behaviors.length > 0) {
        const behaviorKeys = f.behaviors.map((label) => {
          const entry = Object.entries(BEHAVIOR_LABELS).find(([, v]) => v === label);
          return entry ? entry[0] : null;
        }).filter(Boolean);
        if (!behaviorKeys.some((bk) => u.behaviors.includes(bk))) return false;
      }

      // Membership
      if (f.membership.length > 0) {
        if (f.membership.includes("Paid") && !f.membership.includes("Unpaid") && !u.paid) return false;
        if (f.membership.includes("Unpaid") && !f.membership.includes("Paid") && u.paid) return false;
      }

      return true;
    });
  }, [appliedFilters]);

  const handleApply = useCallback(() => {
    setIsApplying(true);
    // Simulate a brief loading state
    setTimeout(() => {
      setAppliedFilters({ ...filters });
      setIsApplying(false);
    }, 600);
  }, [filters]);

  const handleReset = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setAppliedFilters({ ...DEFAULT_FILTERS });
  }, []);

  const handleSave = useCallback(() => {
    showToast("Filters saved!");
  }, [showToast]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="text-sm text-muted">Welcome back</div>
          <h1 className="font-display text-3xl font-bold">{userName || "Admin"}</h1>
          <div className="text-xs text-muted mt-1">Admin Portal</div>
        </div>
        <button
          className="btn-secondary md:hidden"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          Filters
        </button>
      </div>

      {/* Layout: sidebar + main */}
      <div className="flex gap-6 items-start">
        <FiltersSidebar
          filters={filters}
          onFilterChange={setFilters}
          onApply={handleApply}
          onReset={handleReset}
          onSave={handleSave}
          isApplying={isApplying}
          mobileOpen={mobileFiltersOpen}
          onMobileClose={() => setMobileFiltersOpen(false)}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6 relative">
          {isApplying && <ShimmerOverlay />}

          <SummaryCards users={filteredUsers} />

          <BehaviorChart users={filteredUsers} />

          <UserTable users={filteredUsers} />
        </div>
      </div>

      <Toast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
