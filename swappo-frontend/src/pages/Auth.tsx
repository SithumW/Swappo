import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "@/styles/pages/Auth.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Recycle, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Auth = () => {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isLogin) {
      if (!formData.name || formData.name.length < 2) {
        setError("Name must be at least 2 characters long");
        return;
      }
      
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    try {
      if (isLogin) {
        await login(formData.email.trim(), formData.password);
      } else {
        await register(formData.name.trim(), formData.email.trim(), formData.password);
      }
      navigate('/marketplace');
    } catch (error: any) {
      const errorMessage = error.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Back Button */}
        <button onClick={handleBack} className="auth-back-button">
          <ArrowLeft className="auth-back-icon" />
          Back
        </button>



        <Card className="auth-card">
          <CardHeader className="auth-card-header">
           <div className="auth-logo-wrapper">
            <div className="auth-logo-bg">
              <img src="/icons/logohome.png" alt="Swappo Logo" className="auth-logo-img" />
            </div>
          </div>

            <div>
              <CardTitle className="auth-card-title">
                {isLogin ? "Welcome Back" : "Join Swappo"}
              </CardTitle>
              <CardDescription className="auth-card-desc">
                {isLogin 
                  ? "Sign in to continue trading with your community" 
                  : "Create your account and start trading sustainably"
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="auth-card-content">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="auth-form-group">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="auth-input-wrapper">
          
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="auth-input"
                      required={!isLogin}
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                </div>
              )}

              <div className="auth-form-group">
                <Label htmlFor="email">Email</Label>
                <div className="auth-input-wrapper">
                  
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <Label htmlFor="password">Password</Label>
                <div className="auth-input-wrapper">
                  
                  <Input
                    id="password"
                    type="password"
                    placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="auth-input"
                    required
                    minLength={isLogin ? undefined : 6}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="auth-form-group">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="auth-input-wrapper">
                    
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="auth-input"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>

              <button type="button" className="auth-google-btn">
                <img src="/icons/google.png" alt="Google Logo" className="auth-google-icon" />
                Sign in with Google
              </button>
            </form>

            <div className="auth-toggle-section">
              <Separator className="auth-separator" />
              <p className="auth-toggle-text">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setFormData({ email: "", password: "", name: "", confirmPassword: "" });
                }}
                className="auth-toggle-btn"
                disabled={isLoading}
              >
                {isLogin ? "Sign up for free" : "Sign in instead"}
              </Button>
            </div>

            {!isLogin && (
              <div className="auth-terms">
                <p>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
                <p className="auth-terms-highlight"> Join the sustainable trading community!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

