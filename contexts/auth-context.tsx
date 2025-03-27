"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"

import type { User } from "@/types"
import { auth, db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Set loading to true when the component mounts
    setLoading(true)

    // Set persistence to LOCAL (persists even when browser is closed)
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Error setting persistence:", error)
    })

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          }

          setUser(userData)

          // Check if user document exists
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (!userDoc.exists()) {
            // Create user document if it doesn't exist
            await setDoc(doc(db, "users", firebaseUser.uid), {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            })
          } else {
            // Update last login time
            await setDoc(doc(db, "users", firebaseUser.uid), { lastLogin: new Date().toISOString() }, { merge: true })
          }
        } else {
          // User is signed out
          setUser(null)
        }
      } catch (error) {
        console.error("Error handling auth state change:", error)
      } finally {
        // Set loading to false regardless of outcome
        setLoading(false)
      }
    })

    // Clean up the subscription
    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Create user document in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email: firebaseUser.email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      })

      toast({
        title: "Account created!",
        description: "You've successfully signed up for ShortifyAI.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      let errorMessage = "An error occurred during sign up"

      // Handle specific Firebase auth errors
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use. Please try another email or sign in."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please check and try again."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      })
      router.push("/dashboard")
    } catch (error: any) {
      let errorMessage = "An error occurred during sign in"

      // Handle specific Firebase auth errors
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password. Please try again."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later or reset your password."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const firebaseUser = result.user

      // Update or create user document
      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
        { merge: true },
      )

      toast({
        title: "Welcome!",
        description: "You've successfully signed in with Google.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      let errorMessage = "An error occurred during Google sign in"

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign in popup was closed. Please try again."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Google sign in failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

