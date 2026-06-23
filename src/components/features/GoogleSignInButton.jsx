import React, { useEffect, useRef } from "react";
import { useGitHub } from "@contexts/GitHubContext";

const GoogleSignInButton = ({ onSuccess, onFailure }) => {
  const { loginWithGoogle } = useGitHub();
  const buttonRef = useRef(null);

  useEffect(() => {
    // Dynamic load of Google GSI Client script
    let script = document.getElementById("google-gsi-client");
    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = "google-gsi-client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const initGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "148810777178-foo.apps.googleusercontent.com",
          callback: async (response) => {
            try {
              if (response.credential) {
                const res = await loginWithGoogle(response.credential);
                if (onSuccess) onSuccess(res?.data?.user);
              }
            } catch (err) {
              console.error("Google Sign-In failed:", err);
              if (onFailure) onFailure(err);
            }
          },
        });

        if (buttonRef.current) {
          const parentWidth = buttonRef.current.parentElement?.getBoundingClientRect().width;
          const targetWidth = parentWidth ? Math.min(Math.max(Math.round(parentWidth), 200), 400) : 320;

          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            width: targetWidth,
          });
        }
      }
    };

    script.addEventListener("load", initGoogleSignIn);
    
    // In case script is already loaded
    if (window.google?.accounts?.id) {
      initGoogleSignIn();
    }

    return () => {
      script.removeEventListener("load", initGoogleSignIn);
    };
  }, [loginWithGoogle, onSuccess, onFailure]);

  return (
    <div className="w-full flex justify-center py-2">
      <div ref={buttonRef} className="w-full"></div>
    </div>
  );
};

export default GoogleSignInButton;
