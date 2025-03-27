"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink, Plus, Trash } from "lucide-react"

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function DomainSettings() {
  const [domains, setDomains] = useState<{ id: string; domain: string; verified: boolean; default: boolean }[]>([
    { id: "1", domain: "short.yourdomain.com", verified: true, default: true },
  ])
  const [newDomain, setNewDomain] = useState("")
  const [isAddingDomain, setIsAddingDomain] = useState(false)
  const { toast } = useToast()

  const handleAddDomain = () => {
    if (!newDomain) {
      toast({
        title: "Domain required",
        description: "Please enter a domain name",
        variant: "destructive",
      })
      return
    }

    // Basic domain validation
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    if (!domainRegex.test(newDomain)) {
      toast({
        title: "Invalid domain",
        description: "Please enter a valid domain name",
        variant: "destructive",
      })
      return
    }

    // Check if domain already exists
    if (domains.some((d) => d.domain === newDomain)) {
      toast({
        title: "Domain exists",
        description: "This domain is already added to your account",
        variant: "destructive",
      })
      return
    }

    const newDomainObj = {
      id: Date.now().toString(),
      domain: newDomain,
      verified: false,
      default: domains.length === 0,
    }

    setDomains([...domains, newDomainObj])
    setNewDomain("")
    setIsAddingDomain(false)

    toast({
      title: "Domain added",
      description: "Your domain has been added. Please verify it to start using it.",
    })
  }

  const handleRemoveDomain = (id: string) => {
    const domainToRemove = domains.find((d) => d.id === id)
    if (domainToRemove?.default) {
      toast({
        title: "Cannot remove default domain",
        description: "Please set another domain as default before removing this one.",
        variant: "destructive",
      })
      return
    }

    setDomains(domains.filter((d) => d.id !== id))
    toast({
      title: "Domain removed",
      description: "The domain has been removed from your account.",
    })
  }

  const handleSetDefault = (id: string) => {
    setDomains(
      domains.map((domain) => ({
        ...domain,
        default: domain.id === id,
      })),
    )
    toast({
      title: "Default domain updated",
      description: "Your default domain has been updated successfully.",
    })
  }

  const handleCopyDnsRecord = () => {
    navigator.clipboard.writeText("CNAME record: links.shortifyai.com")
    toast({
      title: "Copied to clipboard",
      description: "DNS record has been copied to your clipboard.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Custom Domains</h3>
          <p className="text-sm text-muted-foreground">Configure custom domains for your shortened URLs.</p>
        </div>
        <Dialog open={isAddingDomain} onOpenChange={setIsAddingDomain}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Domain</DialogTitle>
              <DialogDescription>Add a custom domain to use for your shortened URLs.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  placeholder="short.yourdomain.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a subdomain like short.yourdomain.com or a custom domain.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingDomain(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDomain}>Add Domain</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {domains.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Domains</CardTitle>
            <CardDescription>Manage your custom domains for shortened URLs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">{domain.domain}</TableCell>
                    <TableCell>
                      {domain.verified ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Check className="mr-1 h-3 w-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pending Verification
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={domain.default}
                        onCheckedChange={() => handleSetDefault(domain.id)}
                        disabled={domain.default || !domain.verified}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!domain.verified && (
                          <Button variant="outline" size="sm" onClick={handleCopyDnsRecord}>
                            <Copy className="mr-1 h-3 w-3" /> DNS Record
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveDomain(domain.id)}
                          disabled={domain.default}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2 border-t px-6 py-4">
            <h4 className="text-sm font-medium">How to verify your domain</h4>
            <ol className="ml-4 list-decimal text-sm text-muted-foreground">
              <li>Add a CNAME record to your domain's DNS settings</li>
              <li>
                Point it to <code className="bg-muted px-1 py-0.5 rounded">links.shortifyai.com</code>
              </li>
              <li>Wait for DNS propagation (can take up to 24 hours)</li>
              <li>We'll automatically verify your domain once it's properly configured</li>
            </ol>
            <div className="mt-2 flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyDnsRecord}>
                <Copy className="mr-2 h-3 w-3" /> Copy DNS Record
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://docs.shortifyai.com/custom-domains" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-3 w-3" /> View Documentation
                </a>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Custom Domains</CardTitle>
            <CardDescription>
              You haven't added any custom domains yet. Add your first domain to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Custom domains allow you to use your own branded domain for shortened URLs.
              </p>
              <Button onClick={() => setIsAddingDomain(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Domain
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

