import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Radio } from "lucide-react";

interface Props { open: boolean; onOpenChange: (o: boolean) => void; reason?: string }

export function AuthModal({ open, onOpenChange, reason }: Props) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handle = async (mode: "in" | "up") => {
    if (!email || password.length < 6) {
      toast.error("Enter a valid email and a password (6+ chars).");
      return;
    }
    setBusy(true);
    const fn = mode === "in" ? signIn : signUp;
    const { error } = await fn(email, password);
    setBusy(false);
    if (error) { toast.error(error); return; }
    toast.success(mode === "in" ? "Welcome back!" : "Account created!");
    onOpenChange(false);
    setPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-border/50 shadow-elegant sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
            <Radio className="h-6 w-6 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center text-2xl">
            <span className="gradient-text">Welcome to MorseLab</span>
          </DialogTitle>
          <DialogDescription className="text-center">
            {reason ?? "Sign in to save your translations and favorites."}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="in" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="in">Sign in</TabsTrigger>
            <TabsTrigger value="up">Create account</TabsTrigger>
          </TabsList>
          {(["in", "up"] as const).map((mode) => (
            <TabsContent key={mode} value={mode} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor={`email-${mode}`}>Email</Label>
                <Input id={`email-${mode}`} type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`pwd-${mode}`}>Password</Label>
                <Input id={`pwd-${mode}`} type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button disabled={busy} onClick={() => handle(mode)}
                className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "in" ? "Sign in" : "Create account"}
              </Button>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}