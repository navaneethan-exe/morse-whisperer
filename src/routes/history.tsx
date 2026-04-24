import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Star, Trash2, Inbox } from "lucide-react";
import { toast } from "sonner";
import { AuthModal } from "@/components/AuthModal";

interface Row {
  id: string;
  input_text: string;
  output_text: string;
  direction: string;
  is_favorite: boolean;
  created_at: string;
}

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — MorseLab" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("translations")
      .select("*").order("created_at", { ascending: false }).limit(200);
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("translations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Deleted");
  };

  const toggleFav = async (row: Row) => {
    const { error } = await supabase.from("translations")
      .update({ is_favorite: !row.is_favorite }).eq("id", row.id);
    if (error) return toast.error(error.message);
    setRows((r) => r.map((x) => x.id === row.id ? { ...x, is_favorite: !x.is_favorite } : x));
  };

  if (!user) {
    return (
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold"><span className="gradient-text">History</span></h1>
        <Card className="glass-strong mt-6 border-border/50 p-8 text-center">
          <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Sign in to see your saved translations.</p>
          <AuthModal open={true} onOpenChange={() => {}} reason="Login required to access history." />
        </Card>
      </div>
    );
  }

  const list = (filter: (r: Row) => boolean) => {
    const items = rows.filter(filter);
    if (loading) return <p className="text-muted-foreground">Loading…</p>;
    if (!items.length) return (
      <Card className="glass-strong border-border/50 p-8 text-center">
        <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">Nothing here yet.</p>
      </Card>
    );
    return (
      <div className="space-y-3">
        {items.map((r) => (
          <Card key={r.id} className="glass border-border/50 p-4 transition-all hover:translate-y-[-2px] hover:shadow-elegant">
            <div className="mb-2 flex items-center justify-between gap-2">
              <Badge variant="secondary" className="text-[10px] uppercase">
                {r.direction === "text-to-morse" ? "Text → Morse" : "Morse → Text"}
              </Badge>
              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
            </div>
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <div><div className="text-[10px] uppercase text-muted-foreground">Input</div>
                <div className="font-mono break-words">{r.input_text}</div></div>
              <div><div className="text-[10px] uppercase text-muted-foreground">Output</div>
                <div className="font-mono break-words">{r.output_text}</div></div>
            </div>
            <div className="mt-3 flex justify-end gap-1">
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(r.output_text); toast.success("Copied"); }}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggleFav(r)}>
                <Star className={`h-4 w-4 ${r.is_favorite ? "fill-accent text-accent" : ""}`} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold lg:text-4xl"><span className="gradient-text">Your History</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">{rows.length} saved translation{rows.length === 1 ? "" : "s"}</p>
      </div>
      <Tabs defaultValue="all">
        <TabsList className="glass border border-border/50">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="fav">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">{list(() => true)}</TabsContent>
        <TabsContent value="fav" className="mt-4">{list((r) => r.is_favorite)}</TabsContent>
      </Tabs>
    </div>
  );
}