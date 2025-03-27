"use client"

import { useEffect, useState } from "react"
import { Moon, Sun, Monitor } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTheme } from "@/contexts/theme-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export function AppearanceSettings() {
  const { theme, toggleTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "system">("system")
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontScale, setFontScale] = useState(100)
  const { toast } = useToast()

  // Initialize the selected theme based on the current theme
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "light" || savedTheme === "dark") {
      setSelectedTheme(savedTheme)
    } else {
      setSelectedTheme("system")
    }

    // Check for saved animation preferences
    const savedAnimations = localStorage.getItem("animations")
    if (savedAnimations !== null) {
      setAnimationsEnabled(savedAnimations === "true")
    }

    const savedReducedMotion = localStorage.getItem("reducedMotion")
    if (savedReducedMotion !== null) {
      setReducedMotion(savedReducedMotion === "true")
    }

    // Check for saved font scale
    const savedFontScale = localStorage.getItem("fontScale")
    if (savedFontScale !== null) {
      setFontScale(Number.parseInt(savedFontScale))
    }
  }, [])

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setSelectedTheme(value)

    if (value === "system") {
      // Check system preference
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.classList.toggle("dark", systemPrefersDark)
      localStorage.removeItem("theme")
    } else {
      // Set explicit theme
      document.documentElement.classList.toggle("dark", value === "dark")
      localStorage.setItem("theme", value)
    }

    toast({
      title: "Theme updated",
      description: `Theme has been set to ${value}.`,
    })
  }

  const handleAnimationsChange = (enabled: boolean) => {
    setAnimationsEnabled(enabled)
    localStorage.setItem("animations", enabled.toString())

    if (enabled) {
      document.documentElement.classList.remove("no-animations")
    } else {
      document.documentElement.classList.add("no-animations")
    }

    toast({
      title: "Animations updated",
      description: enabled ? "Animations have been enabled." : "Animations have been disabled.",
    })
  }

  const handleReducedMotionChange = (enabled: boolean) => {
    setReducedMotion(enabled)
    localStorage.setItem("reducedMotion", enabled.toString())

    if (enabled) {
      document.documentElement.classList.add("reduced-motion")
    } else {
      document.documentElement.classList.remove("reduced-motion")
    }

    toast({
      title: "Reduced motion updated",
      description: enabled ? "Reduced motion has been enabled." : "Reduced motion has been disabled.",
    })
  }

  const handleFontScaleChange = (value: number[]) => {
    const newScale = value[0]
    setFontScale(newScale)
    localStorage.setItem("fontScale", newScale.toString())

    document.documentElement.style.fontSize = `${newScale}%`

    toast({
      title: "Font size updated",
      description: `Font size has been set to ${newScale}%.`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">Customize how ShortifyAI looks and feels.</p>
      </div>

      <Tabs defaultValue="theme">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Preferences</CardTitle>
              <CardDescription>Choose your preferred theme for the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={selectedTheme}
                onValueChange={(value) => handleThemeChange(value as "light" | "dark" | "system")}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
                  <Label
                    htmlFor="theme-light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Sun className="mb-3 h-6 w-6" />
                    Light
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
                  <Label
                    htmlFor="theme-dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Moon className="mb-3 h-6 w-6" />
                    Dark
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
                  <Label
                    htmlFor="theme-system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Monitor className="mb-3 h-6 w-6" />
                    System
                  </Label>
                </div>
              </RadioGroup>

              <div className="text-sm text-muted-foreground">
                {selectedTheme === "system" ? (
                  <p>Your theme will match your system preferences.</p>
                ) : (
                  <p>Your theme is set to {selectedTheme} mode.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Settings</CardTitle>
              <CardDescription>Customize accessibility options to improve your experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="font-scale">Font Size</Label>
                  <span className="text-sm">{fontScale}%</span>
                </div>
                <Slider
                  id="font-scale"
                  min={75}
                  max={150}
                  step={5}
                  value={[fontScale]}
                  onValueChange={handleFontScaleChange}
                />
                <p className="text-xs text-muted-foreground">Adjust the font size across the application.</p>
              </div>

              <div className="flex items-center justify-between space-y-0 pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="reduced-motion">Reduced Motion</Label>
                  <p className="text-xs text-muted-foreground">Minimize animations and motion effects.</p>
                </div>
                <Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={handleReducedMotionChange} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced appearance options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <Label htmlFor="animations">Animations</Label>
                  <p className="text-xs text-muted-foreground">Enable or disable all animations.</p>
                </div>
                <Switch id="animations" checked={animationsEnabled} onCheckedChange={handleAnimationsChange} />
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset all appearance settings to defaults
                    handleThemeChange("system")
                    handleAnimationsChange(true)
                    handleReducedMotionChange(false)
                    handleFontScaleChange([100])

                    toast({
                      title: "Settings reset",
                      description: "All appearance settings have been reset to defaults.",
                    })
                  }}
                >
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

