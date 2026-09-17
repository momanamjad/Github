import React, { useEffect, useRef } from "react";
import { useGitHub } from "@contexts/GitHubContext";

const GoogleSignInButton = ({ onSuccess, onFailure }) => {
  const { loginWithGoogle } = useGitHub();
  const buttonRef = useRef(null);
  const callbacksRef = useRef({ onSuccess, onFailure, loginWithGoogle });

  useEffect(() => {
    callbacksRef.current = { onSuccess, onFailure, loginWithGoogle };
  });

  useEffect(() => {
    let isMounted = true;

    const initGoogleSignIn = () => {
      if (!isMounted || !window.google?.accounts?.id || !buttonRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "449332130013-6jrl1ke3f7l3o3fdd26oqgckndceq2cf.apps.googleusercontent.com",
          callback: async (response) => {
            try {
              if (response.credential) {
                const res = await callbacksRef.current.loginWithGoogle(response.credential);
                callbacksRef.current.onSuccess?.(res?.data?.user);
              }
            } catch (err) {
              console.error("Google Sign-In failed:", err);
              callbacksRef.current.onFailure?.(err);
            }
          },
        });

        const parentWidth = buttonRef.current.parentElement?.getBoundingClientRect().width;
        const targetWidth = parentWidth ? Math.min(Math.max(Math.round(parentWidth), 200), 400) : 320;

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: targetWidth,
        });
      } catch (e) {
        console.warn("Failed to initialize Google Sign-In:", e);
      }
    };

    let script = document.getElementById("google-gsi-client");
    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = "google-gsi-client";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", initGoogleSignIn);
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initGoogleSignIn();
    } else {
      script.addEventListener("load", initGoogleSignIn);
    }

    return () => {
      isMounted = false;
      if (script) {
        script.removeEventListener("load", initGoogleSignIn);
      }
    };
  }, []);

  return (
    <div className="w-full flex justify-center py-2">
      <div ref={buttonRef} className="w-full"></div>
    </div>
  );
};

export default GoogleSignInButton;
