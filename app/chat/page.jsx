import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatRoom from "@/components/ChatRoom";
import DemoChat from "@/components/DemoChat";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  let user = null;
  let room = null;
  let messages = [];
  let profilesById = {};
  let memberCount = 0;

  try {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    if (user) {
      // Find default room
      let { data: defaultRoom } = await supabase.from("chat_rooms").select("*").eq("is_default", true).maybeSingle();
      if (!defaultRoom) {
        const { data } = await supabase.from("chat_rooms").select("*").limit(1).maybeSingle();
        defaultRoom = data;
      }
      room = defaultRoom;

      if (room) {
        // Join idempotently
        await supabase.from("chat_members").upsert({ room_id: room.id, user_id: user.id }, { onConflict: "room_id,user_id" });

        const { data: msgs } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("room_id", room.id)
          .order("created_at", { ascending: true })
          .limit(100);
        messages = msgs || [];

        // Hydrate profiles for all message authors
        const userIds = Array.from(new Set(messages.map((m) => m.user_id)));
        const { data: profs } = userIds.length
          ? await supabase.from("profiles").select("id,display_name,avatar_url").in("id", userIds)
          : { data: [] };
        profilesById = Object.fromEntries((profs || []).map((p) => [p.id, p]));

        // Get member count
        const { count } = await supabase
          .from("chat_members")
          .select("*", { count: "exact", head: true })
          .eq("room_id", room.id);
        memberCount = count || 0;
      }
    }
  } catch {
    // Auth or DB error — fall through to demo mode
    user = null;
    room = null;
  }

  const showReal = user && room;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Chat</h1>
            <p className="text-muted text-sm mt-1">
              Live community lounge &middot; {showReal ? memberCount : 142} members
            </p>
          </div>
        </div>
        {showReal ? (
          <ChatRoom
            roomId={room.id}
            roomName={room.name}
            currentUser={{ id: user.id }}
            initialMessages={messages}
            profilesById={profilesById}
          />
        ) : (
          <DemoChat />
        )}
      </main>
      <Footer />
    </>
  );
}
