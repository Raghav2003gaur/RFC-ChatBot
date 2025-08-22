"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  FileText,
  Calendar,
  GitBranch,
  Mail,
  ExternalLink,
  TrendingUp,
  Target,
  Activity,
  MessageSquare,
  Globe,
  Shield,
  Zap,
  Network,
  Database,
} from "lucide-react"

interface WorkingGroup {
  acronym: string
  name: string
  area: string
  status: "Active" | "Concluded" | "BOF" | "Proposed"
  chairs: string[]
  description: string
  charter: string
  activeDrafts: number
  rfcsPublished: number
  lastMeeting: string
  nextMeeting?: string
  mailingList: string
  githubRepo?: string
  recentActivity: ActivityItem[]
  milestones: Milestone[]
  hotTopics: string[]
}

interface ActivityItem {
  type: "draft" | "meeting" | "rfc" | "discussion"
  title: string
  date: string
  description: string
}

interface Milestone {
  title: string
  status: "completed" | "in-progress" | "planned"
  dueDate: string
  progress: number
}

const mockWorkingGroups: WorkingGroup[] = [
  {
    acronym: "TLS",
    name: "Transport Layer Security",
    area: "Security",
    status: "Active",
    chairs: ["Sean Turner", "Joe Salowey"],
    description:
      "The Transport Layer Security (TLS) Working Group is chartered to produce a transport layer security protocol based on SSL 3.0.",
    charter: "Develop and maintain the TLS protocol for secure communications over the Internet.",
    activeDrafts: 12,
    rfcsPublished: 8,
    lastMeeting: "2024-01-15",
    nextMeeting: "2024-03-20",
    mailingList: "tls@ietf.org",
    githubRepo: "tlswg/tls13-spec",
    recentActivity: [
      {
        type: "draft",
        title: "TLS 1.3 Extension for Certificate Compression",
        date: "2024-01-10",
        description: "New draft submitted for certificate compression in TLS 1.3",
      },
      {
        type: "meeting",
        title: "Interim Meeting on Post-Quantum Cryptography",
        date: "2024-01-05",
        description: "Discussion on integrating post-quantum algorithms",
      },
      {
        type: "rfc",
        title: "RFC 9001 Published",
        date: "2023-12-20",
        description: "Using TLS to Secure QUIC",
      },
    ],
    milestones: [
      {
        title: "TLS 1.3 Certificate Compression",
        status: "in-progress",
        dueDate: "2024-04-01",
        progress: 75,
      },
      {
        title: "Post-Quantum TLS Extension",
        status: "planned",
        dueDate: "2024-08-01",
        progress: 25,
      },
    ],
    hotTopics: ["Post-Quantum Cryptography", "Certificate Compression", "QUIC Integration"],
  },
  {
    acronym: "HTTP",
    name: "Hypertext Transfer Protocol",
    area: "Applications and Real-Time",
    status: "Active",
    chairs: ["Mark Nottingham", "Julian Reschke"],
    description: "The HTTP Working Group is chartered to maintain and evolve the Hypertext Transfer Protocol.",
    charter: "Maintain HTTP specifications and develop new features for web protocols.",
    activeDrafts: 8,
    rfcsPublished: 15,
    lastMeeting: "2024-01-20",
    nextMeeting: "2024-03-25",
    mailingList: "ietf-http-wg@w3.org",
    githubRepo: "httpwg/http-core",
    recentActivity: [
      {
        type: "draft",
        title: "HTTP/3 Prioritization",
        date: "2024-01-18",
        description: "Updated draft on HTTP/3 request prioritization",
      },
      {
        type: "discussion",
        title: "Structured Fields Discussion",
        date: "2024-01-12",
        description: "Mailing list discussion on structured field definitions",
      },
    ],
    milestones: [
      {
        title: "HTTP/3 Prioritization Standard",
        status: "in-progress",
        dueDate: "2024-06-01",
        progress: 60,
      },
      {
        title: "Structured Fields RFC",
        status: "completed",
        dueDate: "2023-12-01",
        progress: 100,
      },
    ],
    hotTopics: ["HTTP/3 Prioritization", "Structured Fields", "Cache Control Extensions"],
  },
  {
    acronym: "OAUTH",
    name: "Web Authorization Protocol",
    area: "Security",
    status: "Active",
    chairs: ["Rifaat Shekh-Yusef", "Aaron Parecki"],
    description: "The OAuth Working Group develops the OAuth 2.0 authorization framework and related specifications.",
    charter: "Develop and maintain OAuth specifications for web authorization.",
    activeDrafts: 15,
    rfcsPublished: 12,
    lastMeeting: "2024-01-12",
    nextMeeting: "2024-03-15",
    mailingList: "oauth@ietf.org",
    githubRepo: "oauthstuff/draft-oauth-v2-1",
    recentActivity: [
      {
        type: "draft",
        title: "OAuth 2.1 Authorization Framework",
        date: "2024-01-08",
        description: "Major revision consolidating OAuth 2.0 best practices",
      },
      {
        type: "meeting",
        title: "Security Considerations Review",
        date: "2024-01-03",
        description: "Review of security implications for OAuth 2.1",
      },
    ],
    milestones: [
      {
        title: "OAuth 2.1 Framework",
        status: "in-progress",
        dueDate: "2024-05-01",
        progress: 80,
      },
      {
        title: "Device Authorization Grant",
        status: "completed",
        dueDate: "2023-11-01",
        progress: 100,
      },
    ],
    hotTopics: ["OAuth 2.1", "Device Flow", "Security Best Practices"],
  },
  {
    acronym: "DNSOP",
    name: "Domain Name System Operations",
    area: "Internet",
    status: "Active",
    chairs: ["Benno Overeinder", "Suzanne Woolf"],
    description: "The DNSOP Working Group addresses operational and security issues in DNS deployment.",
    charter: "Address DNS operational issues and security considerations.",
    activeDrafts: 20,
    rfcsPublished: 25,
    lastMeeting: "2024-01-25",
    nextMeeting: "2024-03-30",
    mailingList: "dnsop@ietf.org",
    githubRepo: "dnsop/draft-dnsop-dns-catalog-zones",
    recentActivity: [
      {
        type: "draft",
        title: "DNS Catalog Zones",
        date: "2024-01-22",
        description: "Updated specification for DNS catalog zones",
      },
      {
        type: "discussion",
        title: "DNSSEC Algorithm Rollover",
        date: "2024-01-18",
        description: "Discussion on algorithm rollover procedures",
      },
    ],
    milestones: [
      {
        title: "DNS Catalog Zones",
        status: "in-progress",
        dueDate: "2024-07-01",
        progress: 70,
      },
      {
        title: "DNSSEC Automation",
        status: "planned",
        dueDate: "2024-09-01",
        progress: 30,
      },
    ],
    hotTopics: ["DNS Catalog Zones", "DNSSEC Automation", "DNS Privacy"],
  },
]

const areaIcons = {
  Security: Shield,
  "Applications and Real-Time": Globe,
  Internet: Network,
  Routing: Zap,
  Transport: Database,
  "Operations and Management": Activity,
}

const areaColors = {
  Security: "bg-red-100 text-red-800 border-red-200",
  "Applications and Real-Time": "bg-blue-100 text-blue-800 border-blue-200",
  Internet: "bg-green-100 text-green-800 border-green-200",
  Routing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Transport: "bg-purple-100 text-purple-800 border-purple-200",
  "Operations and Management": "bg-gray-100 text-gray-800 border-gray-200",
}

type AudienceType = "policymaker" | "technical" | "newcomer"

interface WorkingGroupDashboardProps {
  audience: AudienceType
  onWorkingGroupSelect?: (wg: WorkingGroup) => void
}

export function WorkingGroupDashboard({ audience, onWorkingGroupSelect }: WorkingGroupDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [areaFilter, setAreaFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedWG, setSelectedWG] = useState<WorkingGroup | null>(null)

  const filteredWorkingGroups = useMemo(() => {
    return mockWorkingGroups.filter((wg) => {
      const matchesSearch =
        wg.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wg.hotTopics.some((topic) => topic.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesArea = areaFilter === "all" || wg.area === areaFilter
      const matchesStatus = statusFilter === "all" || wg.status === statusFilter

      return matchesSearch && matchesArea && matchesStatus
    })
  }, [searchQuery, areaFilter, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "Concluded":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "BOF":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Proposed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "draft":
        return FileText
      case "meeting":
        return Calendar
      case "rfc":
        return Target
      case "discussion":
        return MessageSquare
      default:
        return Activity
    }
  }

  const getAudienceExplanation = (wg: WorkingGroup) => {
    if (audience === "policymaker") {
      return `Policy Relevance: The ${wg.name} working group influences ${wg.area.toLowerCase()} standards that affect internet governance, security policies, and regulatory compliance. Their work on ${wg.hotTopics.join(", ")} has direct implications for policy frameworks.`
    } else if (audience === "technical") {
      return `Technical Focus: This working group maintains ${wg.rfcsPublished} published RFCs and ${wg.activeDrafts} active drafts. Key technical areas include ${wg.hotTopics.join(", ")}. Monitor their GitHub repository and mailing list for implementation details.`
    } else {
      return `What They Do: The ${wg.name} working group is like a committee of experts who create the rules for ${wg.area.toLowerCase()} on the internet. They're currently working on ${wg.hotTopics[0]} and other important technologies that help keep the internet running smoothly.`
    }
  }

  const areas = Array.from(new Set(mockWorkingGroups.map((wg) => wg.area)))

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Working Group Intelligence</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search working groups, topics, or areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Concluded">Concluded</SelectItem>
                <SelectItem value="BOF">BOF</SelectItem>
                <SelectItem value="Proposed">Proposed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredWorkingGroups.filter((wg) => wg.status === "Active").length}
                </p>
                <p className="text-xs text-muted-foreground">Active WGs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredWorkingGroups.reduce((sum, wg) => sum + wg.activeDrafts, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Active Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredWorkingGroups.reduce((sum, wg) => sum + wg.rfcsPublished, 0)}
                </p>
                <p className="text-xs text-muted-foreground">RFCs Published</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{filteredWorkingGroups.filter((wg) => wg.nextMeeting).length}</p>
                <p className="text-xs text-muted-foreground">Upcoming Meetings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Working Groups List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredWorkingGroups.length} working group{filteredWorkingGroups.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-4">
            {filteredWorkingGroups.map((wg) => {
              const AreaIcon = areaIcons[wg.area as keyof typeof areaIcons] || Network
              return (
                <Card key={wg.acronym} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="font-mono font-bold">
                            {wg.acronym}
                          </Badge>
                          <Badge className={getStatusColor(wg.status)}>{wg.status}</Badge>
                          <Badge variant="secondary" className={areaColors[wg.area as keyof typeof areaColors]}>
                            <AreaIcon className="w-3 h-3 mr-1" />
                            {wg.area}
                          </Badge>
                        </div>

                        <CardTitle className="text-lg leading-tight">{wg.name}</CardTitle>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {wg.activeDrafts} drafts
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {wg.rfcsPublished} RFCs
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {wg.chairs.length} chair{wg.chairs.length !== 1 ? "s" : ""}
                          </div>
                          {wg.nextMeeting && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Next: {new Date(wg.nextMeeting).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedWG(wg)}>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {wg.acronym}: {wg.name}
                              <Badge className={getStatusColor(wg.status)}>{wg.status}</Badge>
                            </DialogTitle>
                            <DialogDescription>{getAudienceExplanation(wg)}</DialogDescription>
                          </DialogHeader>

                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="overview">Overview</TabsTrigger>
                              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                              <TabsTrigger value="milestones">Milestones</TabsTrigger>
                              <TabsTrigger value="resources">Resources</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Description</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{wg.description}</p>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">Charter</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{wg.charter}</p>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">Chairs</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {wg.chairs.map((chair, index) => (
                                      <Badge key={index} variant="outline">
                                        {chair}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">Hot Topics</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {wg.hotTopics.map((topic, index) => (
                                      <Badge key={index} variant="secondary">
                                        {topic}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="activity" className="space-y-4">
                              <div className="space-y-3">
                                {wg.recentActivity.map((activity, index) => {
                                  const ActivityIcon = getActivityIcon(activity.type)
                                  return (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                                      <ActivityIcon className="w-4 h-4 mt-0.5 text-primary" />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h5 className="font-medium text-sm">{activity.title}</h5>
                                          <Badge variant="outline" className="text-xs">
                                            {activity.type}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-1">{activity.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(activity.date).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </TabsContent>

                            <TabsContent value="milestones" className="space-y-4">
                              <div className="space-y-4">
                                {wg.milestones.map((milestone, index) => (
                                  <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h5 className="font-medium text-sm">{milestone.title}</h5>
                                      <Badge
                                        variant={
                                          milestone.status === "completed"
                                            ? "default"
                                            : milestone.status === "in-progress"
                                              ? "secondary"
                                              : "outline"
                                        }
                                      >
                                        {milestone.status}
                                      </Badge>
                                    </div>
                                    <Progress value={milestone.progress} className="h-2" />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <span>{milestone.progress}% complete</span>
                                      <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TabsContent>

                            <TabsContent value="resources" className="space-y-4">
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <Card>
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Mail className="w-4 h-4" />
                                        <h5 className="font-medium">Mailing List</h5>
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-2">{wg.mailingList}</p>
                                      <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                                        <ExternalLink className="w-3 h-3" />
                                        Subscribe
                                      </Button>
                                    </CardContent>
                                  </Card>

                                  {wg.githubRepo && (
                                    <Card>
                                      <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                          <GitBranch className="w-4 h-4" />
                                          <h5 className="font-medium">GitHub Repository</h5>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{wg.githubRepo}</p>
                                        <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                                          <ExternalLink className="w-3 h-3" />
                                          View Repo
                                        </Button>
                                      </CardContent>
                                    </Card>
                                  )}

                                  <Card>
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4" />
                                        <h5 className="font-medium">Meetings</h5>
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-1">
                                        Last: {new Date(wg.lastMeeting).toLocaleDateString()}
                                      </p>
                                      {wg.nextMeeting && (
                                        <p className="text-sm text-muted-foreground mb-2">
                                          Next: {new Date(wg.nextMeeting).toLocaleDateString()}
                                        </p>
                                      )}
                                      <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                                        <ExternalLink className="w-3 h-3" />
                                        Meeting Materials
                                      </Button>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4" />
                                        <h5 className="font-medium">Statistics</h5>
                                      </div>
                                      <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Active Drafts:</span>
                                          <span>{wg.activeDrafts}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Published RFCs:</span>
                                          <span>{wg.rfcsPublished}</span>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-2 mb-3">{wg.description}</CardDescription>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {wg.hotTopics.slice(0, 2).map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                        {wg.hotTopics.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{wg.hotTopics.length - 2} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {wg.githubRepo && (
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <GitBranch className="w-3 h-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Mail className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
