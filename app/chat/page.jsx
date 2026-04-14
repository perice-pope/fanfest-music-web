import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatRoom from "@/components/ChatRoom";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Find default room
  let { data: room } = await supabase.from("chat_rooms").select("*").eq("is_default", true).maybeSingle();
  if (!room) {
    // fallback pick first
    const { data } = await supabase.from("chat_rooms").select("*").limit(1).maybeSingle();
    room = data;
  }

  // Join idempotently
  if (room) {
    await supabase.from("chat_members").upsert({ room_id: room.id, user_id: user.id }, { onConflict: "room_id,user_id" });
  }

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("room_id", room.id)
    .order("created_at", { ascending: true })
    .limit(100);

  const userIds = Array.from(new Set((messages || []).map((m) => m.user_id)));
  const { data: profs } = userIds.length
    ? await supabase.from("profiles").select("id,display_name,avatar_url").in("id", userIds)
    : { data: [] };
  const profilesById = Object.fromEntries((profs || []).map((p) => [p.id, p]));

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold">Chat</h1>
          <p className="text-muted text-sm mt-1">Live community lounge · realtime</p>
        </div>
        <ChatRoom
          roomId={room.id}
          currentUser={{ id: user.id }}
          initialMessages={messages || []}
          profilesById={profilesById}
        />
      </main>
      <Footer />
    </>
  );
}
