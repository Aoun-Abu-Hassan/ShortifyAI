"use client"

import { useState } from "react"
import { Copy, ExternalLink, Plus, RefreshCw, Key } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type Integration = {
  id: string
  name: string
  type: "analytics" | "social" | "marketing" | "other"
  connected: boolean
  icon: string
}

export function IntegrationSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: "ga", name: "Google Analytics", type: "analytics", connected: true, icon: "G" },
    { id: "fb", name: "Facebook Pixel", type: "analytics", connected: false, icon: "F" },
    { id: "twitter", name: "Twitter", type: "social", connected: false, icon: "T" },
    { id: "mailchimp", name: "Mailchimp", type: "marketing", connected: false, icon: "M" },
    { id: "zapier", name: "Zapier", type: "other", connected: true, icon: "Z" },
  ])
  const [apiKey, setApiKey] = useState("sk_live_shortify_12345abcdefghijklmnopqrstuvwxyz")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false)
  const [isAddingWebhook, setIsAddingWebhook] = useState(false)
  const { toast } = useToast()

  const handleToggleIntegration = (id: string) => {
    setIntegrations(
      integrations.map((integration) =>
        integration.id === id ? { ...integration, connected: !integration.connected } : integration,
      ),
    )

    const integration = integrations.find((i) => i.id === id)
    if (integration) {
      toast({
        title: integration.connected ? "Integration disconnected" : "Integration connected",
        description: `${integration.name} has been ${integration.connected ? "disconnected" : "connected"} successfully.`,
      })
    }
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast({
      title: "API key copied",
      description: "Your API key has been copied to the clipboard.",
    })
  }

  const handleRegenerateApiKey = () => {
    setIsRegeneratingKey(true)

    // Simulate API call
    setTimeout(() => {
      const newApiKey =
        "sk_live_shortify_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      setApiKey(newApiKey)
      setIsRegeneratingKey(false)

      toast({
        title: "API key regenerated",
        description: "Your new API key has been generated. The old key is no longer valid.",
      })
    }, 1000)
  }

  const handleAddWebhook = () => {
    if (!webhookUrl) {
      toast({
        title: "Webhook URL required",
        description: "Please enter a webhook URL",
        variant: "destructive",
      })
      return
    }

    // Basic URL validation
    try {
      new URL(webhookUrl)
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid webhook URL",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Webhook added",
      description: "Your webhook has been added successfully.",
    })

    setWebhookUrl("")
    setIsAddingWebhook(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrations & API</h3>
        <p className="text-sm text-muted-foreground">Connect third-party services and manage API access.</p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="api-keys">
          <AccordionTrigger>API Keys</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>Manage your API keys for programmatic access to ShortifyAI.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      readOnly
                      className="flex-1 rounded-r-none font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      className="rounded-l-none border-l-0"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={handleCopyApiKey}>
                      <Copy className="mr-2 h-3 w-3" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRegenerateApiKey} disabled={isRegeneratingKey}>
                      {isRegeneratingKey ? (
                        <>
                          <RefreshCw className="mr-2 h-3 w-3 animate-spin" /> Regenerating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-3 w-3" /> Regenerate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Keep your API key secure. Never share it publicly.</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://docs.shortifyai.com/api" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-3 w-3" /> API Documentation
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="webhooks">
          <AccordionTrigger>Webhooks</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>Receive real-time notifications when events happen in your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={isAddingWebhook} onOpenChange={setIsAddingWebhook}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Webhook</DialogTitle>
                      <DialogDescription>Add a webhook URL to receive event notifications.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="webhook-url">Webhook URL</Label>
                        <Input
                          id="webhook-url"
                          placeholder="https://your-app.com/webhook"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="webhook-events">Events</Label>
                        <Select defaultValue="all">
                          <SelectTrigger id="webhook-events">
                            <SelectValue placeholder="Select events" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All events</SelectItem>
                            <SelectItem value="link.created">Link created</SelectItem>
                            <SelectItem value="link.clicked">Link clicked</SelectItem>
                            <SelectItem value="link.updated">Link updated</SelectItem>
                            <SelectItem value="link.deleted">Link deleted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingWebhook(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddWebhook}>Add Webhook</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="rounded-md border p-4">
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No webhooks configured yet. Add a webhook to receive event notifications.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://docs.shortifyai.com/webhooks" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-3 w-3" /> Webhook Documentation
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="third-party">
          <AccordionTrigger>Third-Party Integrations</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Connected Services</CardTitle>
                <CardDescription>Manage integrations with third-party services.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["analytics", "social", "marketing", "other"].map((type) => {
                    const typeIntegrations = integrations.filter((i) => i.type === type)
                    if (typeIntegrations.length === 0) return null

                    return (
                      <div key={type} className="space-y-2">
                        <h4 className="text-sm font-medium capitalize">{type}</h4>
                        <div className="space-y-2">
                          {typeIntegrations.map((integration) => (
                            <div
                              key={integration.id}
                              className="flex items-center justify-between rounded-lg border p-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                  {integration.icon}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{integration.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {integration.connected ? "Connected" : "Not connected"}
                                  </p>
                                </div>
                              </div>
                              <Switch
                                checked={integration.connected}
                                onCheckedChange={() => handleToggleIntegration(integration.id)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Need more integrations?{" "}
                  <a href="#" className="text-primary hover:underline">
                    Request a feature
                  </a>
                </div>
              </CardFooter>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

