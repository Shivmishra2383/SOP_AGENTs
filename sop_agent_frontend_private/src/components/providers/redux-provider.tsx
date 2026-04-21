"use client";

import { Provider, useDispatch } from "react-redux";
import { store, AppDispatch } from "@/redux/store";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { setUser, setLoading, logout } from "@/redux/authSlice";
import { doc, getDoc } from "firebase/firestore";
import API from "@/lib/api";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    dispatch(setLoading(true));

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db!, "users", firebaseUser.uid));
            const userData = userDoc.data();

            dispatch(setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || userData?.name,
              role: userData?.role || "user"
            }));
          } catch (error) {
            console.error("Error fetching user data from Firestore:", error);
            dispatch(setUser(null));
          }
        } else {
          dispatch(setUser(null));
        }

        dispatch(setLoading(false));
        setInitialized(true);
      });

      return () => unsubscribe();
    }

    const initLocalAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          dispatch(setUser(null));
          return;
        }

        const response = await API.get("/auth/profile");
        dispatch(setUser(response.data));
      } catch (error) {
        console.error("Error restoring local auth session:", error);
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
        setInitialized(true);
      }
    };

    initLocalAuth();
  }, [dispatch]);

  if (!initialized) {
    return null;
  }

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
