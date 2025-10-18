import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Lock, 
  Trash2, 
  Save, 
  AlertTriangle,
  LogOut,
  Shield
} from "lucide-react";
import { getCurrentUser, signOut } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          toast({
            title: "Not logged in",
            description: "Please login to access your profile",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        setCurrentUser(user);
        setEmail(user.email || "");
      } catch (error) {
        console.error("Error loading user:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate, toast]);

  // Update email
  const handleUpdateEmail = async () => {
    if (!email || email === currentUser?.email) {
      toast({
        title: "No changes",
        description: "Email is the same as current",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.auth.updateUser({ email });

      if (error) throw error;

      toast({
        title: "Email updated",
        description: "Check your new email for confirmation link",
      });
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update password
  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in both password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
      
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== currentUser?.email) {
      toast({
        title: "Email doesn't match",
        description: "Please enter your exact email address to confirm",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { clearChatHistory } = await import("@/lib/chat-storage");
      
      // Clear all user data first
      await clearChatHistory();
      
      // Delete user account
      const { error } = await supabase.rpc('delete_user');
      
      if (error) {
        // If RPC doesn't exist, try admin API approach
        console.error("RPC delete_user not found, using auth signOut");
        await signOut();
        
        toast({
          title: "Account logout",
          description: "Please contact support to permanently delete your account",
        });
        navigate("/");
        return;
      }

      toast({
        title: "Account deleted",
        description: "Your account and all data have been permanently deleted",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <section className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile, security, and account preferences
            </p>
          </div>

          {/* User Info Card */}
          <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{currentUser?.email}</h3>
                <p className="text-sm text-muted-foreground">
                  Account created: {new Date(currentUser?.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Update */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Email Address</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll need to verify your new email address
                  </p>
                </div>

                <Button
                  onClick={handleUpdateEmail}
                  disabled={isSaving || email === currentUser?.email}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Updating..." : "Update Email"}
                </Button>
              </div>
            </Card>

            {/* Password Update */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Password</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  onClick={handleUpdatePassword}
                  disabled={isSaving || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {isSaving ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Account Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logout */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <LogOut className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Logout</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Sign out of your account on this device
              </p>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </Card>

            {/* Delete Account */}
            <Card className="p-6 border-destructive/50 bg-destructive/5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Delete Account Permanently?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                      <p>
                        This action <strong>cannot be undone</strong>. This will permanently delete:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Your account and profile</li>
                        <li>All chat history and conversations</li>
                        <li>All uploaded documents and data</li>
                        <li>All settings and preferences</li>
                      </ul>
                      <div className="pt-4">
                        <Label htmlFor="confirmEmail" className="text-foreground">
                          Type your email <strong>{currentUser?.email}</strong> to confirm:
                        </Label>
                        <Input
                          id="confirmEmail"
                          type="email"
                          value={deleteConfirmEmail}
                          onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="mt-2"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmEmail("")}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || deleteConfirmEmail !== currentUser?.email}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Delete My Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/demo")}
            >
              ← Back to AI Assistant
            </Button>
          </div>
        </div>
      </div>
      <Footer />
      </section>
    </>
  );
};

export default Profile;
