"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Bell, Calendar, FileText, Users, Settings, Mail, Smartphone, Clock, TrendingUp, Star } from "lucide-react"

interface NotificationPreference {
  id: string
  category: "rfc" | "working-group" | "meeting" | "policy" | "digest"
  title: string
  description: string
  enabled: boolean
  frequency: "immediate" | "daily" | "weekly"
  channels: ("email" | "push" | "in-app")[]
}

interface Notification {
  id: string
  type: "rfc-published" | "draft-updated" | "meeting-scheduled" | "policy-update" | "digest" | "milestone"
  title: string
  description: string
  timestamp: Date
  read: boolean
  priority: "low" | "medium" | "high"
  metadata?: {
    rfcNumber?: string
    workingGroup?: string
    meetingDate?: string
    category?: string
  }
  audienceRelevance: ("policymaker" | "technical" | "newcomer")[]
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "rfc-published",
    title: "RFC 9110 Published: HTTP Semantics",
    description:
      "New RFC published updating HTTP protocol semantics with significant policy implications for web privacy.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    priority: "high",
    metadata: { rfcNumber: "9110", category: "Standards Track" },
    audienceRelevance: ["policymaker", "technical"],
  },
  {
    id: "2",
    type: "meeting-scheduled",
    title: "TLS Working Group Interim Meeting",
    description: "Interim meeting scheduled to discuss post-quantum cryptography integration in TLS 1.3.",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: false,
    priority: "medium",
    metadata: { workingGroup: "TLS", meetingDate: "2024-03-20", category: "Security" },
    audienceRelevance: ["technical"],
  },
  {
    id: "3",
    type: "policy-update",
    title: "Privacy Enhancement Guidelines Updated",
    description:
      "IETF Privacy Enhancements and Assessments Research Group published new guidelines affecting data governance.",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: true,
    priority: "high",
    metadata: { workingGroup: "PEARG", category: "Privacy" },
    audienceRelevance: ["policymaker"],
  },
  {
    id: "4",
    type: "draft-updated",
    title: "OAuth 2.1 Draft Updated",
    description: "Major revision to OAuth 2.1 authorization framework incorporating security best practices.",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    priority: "medium",
    metadata: { workingGroup: "OAUTH", category: "Security" },
    audienceRelevance: ["technical", "policymaker"],
  },
  {
    id: "5",
    type: "digest",
    title: "Weekly IETF Digest",
    description: "Your personalized weekly summary of IETF activities, new RFCs, and upcoming meetings.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: false,
    priority: "low",
    audienceRelevance: ["policymaker", "technical", "newcomer"],
  },
]

const defaultPreferences: NotificationPreference[] = [
  {
    id: "rfc-published",
    category: "rfc",
    title: "New RFCs Published",
    description: "Get notified when new RFCs are published in your areas of interest",
    enabled: true,
    frequency: "immediate",
    channels: ["email", "in-app"],
  },
  {
    id: "draft-updates",
    category: "rfc",
    title: "Draft Updates",
    description: "Notifications for updates to Internet-Drafts you're following",
    enabled: true,
    frequency: "daily",
    channels: ["in-app"],
  },
  {
    id: "wg-meetings",
    category: "meeting",
    title: "Working Group Meetings",
    description: "Meeting schedules, agendas, and outcomes for followed working groups",
    enabled: true,
    frequency: "immediate",
    channels: ["email", "push", "in-app"],
  },
  {
    id: "policy-updates",
    category: "policy",
    title: "Policy-Relevant Updates",
    description: "Standards updates with governance and regulatory implications",
    enabled: false,
    frequency: "weekly",
    channels: ["email"],
  },
  {
    id: "weekly-digest",
    category: "digest",
    title: "Weekly IETF Digest",
    description: "Personalized weekly summary tailored to your audience type",
    enabled: true,
    frequency: "weekly",
    channels: ["email", "in-app"],
  },
  {
    id: "milestone-updates",
    category: "working-group",
    title: "Working Group Milestones",
    description: "Progress updates on working group milestones and deliverables",
    enabled: false,
    frequency: "weekly",
    channels: ["in-app"],
  },
]

type AudienceType = "policymaker" | "technical" | "newcomer"

interface NotificationsSystemProps {
  audience: AudienceType
  onNotificationClick?: (notification: Notification) => void
}

export function NotificationsSystem({ audience, onNotificationClick }: NotificationsSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [preferences, setPreferences] = useState<NotificationPreference[]>(defaultPreferences)
  const [filter, setFilter] = useState<string>("all")
  const [showSettings, setShowSettings] = useState(false)

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read
    if (filter === "high") return notification.priority === "high"
    if (filter === "relevant") return notification.audienceRelevance.includes(audience)
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const updatePreference = (preferenceId: string, updates: Partial<NotificationPreference>) => {
    setPreferences((prev) => prev.map((p) => (p.id === preferenceId ? { ...p, ...updates } : p)))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "rfc-published":
        return FileText
      case "draft-updated":
        return FileText
      case "meeting-scheduled":
        return Calendar
      case "policy-update":
        return Users
      case "digest":
        return Mail
      case "milestone":
        return TrendingUp
      default:
        return Bell
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getAudienceDigest = () => {
    if (audience === "policymaker") {
      return {
        title: "Policy-Focused Weekly Digest",
        content: [
          "🏛️ **Governance Updates**: New privacy guidelines from PEARG affecting data protection regulations",
          "📋 **Policy-Relevant RFCs**: RFC 9110 HTTP Semantics - impacts web privacy and consent mechanisms",
          "🤝 **Standards Coordination**: IETF-W3C liaison on web security standards alignment",
          "📊 **Regulatory Impact**: 3 new standards with potential compliance implications this week",
          "🔍 **Upcoming Decisions**: TLS post-quantum crypto adoption timeline affects cybersecurity policy",
        ],
      }
    } else if (audience === "technical") {
      return {
        title: "Technical Weekly Digest",
        content: [
          "🔧 **New RFCs**: RFC 9110 (HTTP Semantics) - breaking changes from RFC 2616",
          "📝 **Active Drafts**: 12 drafts updated across Security and Internet areas",
          "👥 **Working Groups**: TLS interim on post-quantum crypto, OAuth 2.1 security review",
          "🚀 **Implementation Updates**: HTTP/3 prioritization spec nearing completion",
          "🔒 **Security Focus**: New DNSSEC automation proposals in DNSOP",
        ],
      }
    } else {
      return {
        title: "Newcomer-Friendly Weekly Digest",
        content: [
          "📚 **Learning Highlights**: New beginner guide to HTTP protocols published",
          "🌟 **Key Concepts**: This week's focus - understanding how web security works",
          "👋 **Community**: 5 new working groups accepting newcomer participation",
          "🎯 **Getting Started**: Recommended reading path for DNS and web protocols",
          "💡 **Did You Know?**: RFCs are living documents that evolve with technology needs",
        ],
      }
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Notifications & Digest</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="relevant">Relevant</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Notification Preferences</DialogTitle>
                <DialogDescription>Customize how and when you receive IETF updates</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="preferences" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="channels">Channels</TabsTrigger>
                </TabsList>

                <TabsContent value="preferences" className="space-y-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {preferences.map((pref) => (
                        <div key={pref.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{pref.title}</h4>
                            <p className="text-xs text-muted-foreground">{pref.description}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Select
                              value={pref.frequency}
                              onValueChange={(value) => updatePreference(pref.id, { frequency: value as any })}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediate">Immediate</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                              </SelectContent>
                            </Select>
                            <Switch
                              checked={pref.enabled}
                              onCheckedChange={(checked) => updatePreference(pref.id, { enabled: checked })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="channels" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <div>
                          <h4 className="font-medium text-sm">Email Notifications</h4>
                          <p className="text-xs text-muted-foreground">Receive updates via email</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <div>
                          <h4 className="font-medium text-sm">Push Notifications</h4>
                          <p className="text-xs text-muted-foreground">Browser and mobile push alerts</p>
                        </div>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        <div>
                          <h4 className="font-medium text-sm">In-App Notifications</h4>
                          <p className="text-xs text-muted-foreground">Show notifications in the app</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Recent Notifications</TabsTrigger>
          <TabsTrigger value="digest">Weekly Digest</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type)
                return (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.read ? "border-l-4 border-l-primary bg-muted/30" : ""
                    }`}
                    onClick={() => {
                      markAsRead(notification.id)
                      onNotificationClick?.(notification)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full bg-muted ${getPriorityColor(notification.priority)}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className={`font-medium text-sm ${!notification.read ? "font-semibold" : ""}`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  notification.priority === "high"
                                    ? "destructive"
                                    : notification.priority === "medium"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {notification.priority}
                              </Badge>
                              {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">{notification.description}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {notification.metadata?.rfcNumber && (
                                <Badge variant="outline" className="text-xs">
                                  RFC {notification.metadata.rfcNumber}
                                </Badge>
                              )}
                              {notification.metadata?.workingGroup && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.metadata.workingGroup} WG
                                </Badge>
                              )}
                              {notification.metadata?.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {notification.metadata.category}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(notification.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="digest" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{getAudienceDigest().title}</CardTitle>
                  <CardDescription>Personalized for {audience} • Updated weekly on Mondays</CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Star className="w-3 h-3" />
                  This Week
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                {getAudienceDigest().content.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <p className="text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Next digest: Monday, March 25, 2024
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    View Archive
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-3 h-3 mr-1" />
                    Email This
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-lg font-bold">3</p>
                    <p className="text-xs text-muted-foreground">New RFCs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-lg font-bold">8</p>
                    <p className="text-xs text-muted-foreground">WG Updates</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-lg font-bold">5</p>
                    <p className="text-xs text-muted-foreground">Meetings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-lg font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Hot Topics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
