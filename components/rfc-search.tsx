"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Search, FileText, Calendar, Users, ExternalLink, GitCompare, Info, Filter } from "lucide-react"

interface RFC {
  number: string
  title: string
  status: "Standards Track" | "BCP" | "Informational" | "Experimental" | "Historic"
  category:
    | "Proposed Standard"
    | "Internet Standard"
    | "Best Current Practice"
    | "Informational"
    | "Experimental"
    | "Historic"
  date: string
  authors: string[]
  abstract: string
  obsoletes?: string[]
  obsoletedBy?: string[]
  updates?: string[]
  updatedBy?: string[]
  workingGroup?: string
  area?: string
  keywords: string[]
}

const mockRFCs: RFC[] = [
  {
    number: "9110",
    title: "HTTP Semantics",
    status: "Standards Track",
    category: "Proposed Standard",
    date: "2022-06",
    authors: ["R. Fielding", "M. Nottingham", "J. Reschke"],
    abstract:
      "The Hypertext Transfer Protocol (HTTP) is a stateless application-level protocol for distributed, collaborative, hypertext information systems. This document describes the overall architecture of HTTP, establishes common terminology, and defines aspects of the protocol that are shared by all versions.",
    obsoletes: ["2616", "7230", "7231", "7232", "7233", "7234", "7235"],
    workingGroup: "HTTP",
    area: "Applications and Real-Time",
    keywords: ["HTTP", "web", "protocol", "semantics"],
  },
  {
    number: "8446",
    title: "The Transport Layer Security (TLS) Protocol Version 1.3",
    status: "Standards Track",
    category: "Proposed Standard",
    date: "2018-08",
    authors: ["E. Rescorla"],
    abstract:
      "This document specifies version 1.3 of the Transport Layer Security (TLS) protocol. TLS allows client/server applications to communicate over the Internet in a way that is designed to prevent eavesdropping, tampering, and message forgery.",
    obsoletes: ["5077"],
    workingGroup: "TLS",
    area: "Security",
    keywords: ["TLS", "security", "encryption", "transport"],
  },
  {
    number: "7540",
    title: "Hypertext Transfer Protocol Version 2 (HTTP/2)",
    status: "Standards Track",
    category: "Proposed Standard",
    date: "2015-05",
    authors: ["M. Belshe", "R. Peon", "M. Thomson"],
    abstract:
      "This specification describes an optimized expression of the semantics of the Hypertext Transfer Protocol (HTTP), referred to as HTTP version 2 (HTTP/2). HTTP/2 enables a more efficient use of network resources and a reduced perception of latency.",
    updatedBy: ["8740"],
    workingGroup: "HTTP",
    area: "Applications and Real-Time",
    keywords: ["HTTP", "HTTP/2", "multiplexing", "performance"],
  },
  {
    number: "3986",
    title: "Uniform Resource Identifier (URI): Generic Syntax",
    status: "Standards Track",
    category: "Internet Standard",
    date: "2005-01",
    authors: ["T. Berners-Lee", "R. Fielding", "L. Masinter"],
    abstract:
      "A Uniform Resource Identifier (URI) is a compact sequence of characters that identifies an abstract or physical resource. This specification defines the generic URI syntax and a process for resolving URI references that might be in relative form.",
    obsoletes: ["2732", "2396", "1808"],
    updatedBy: ["6874", "7320"],
    area: "Applications and Real-Time",
    keywords: ["URI", "URL", "syntax", "web"],
  },
  {
    number: "2119",
    title: "Key words for use in RFCs to Indicate Requirement Levels",
    status: "BCP",
    category: "Best Current Practice",
    date: "1997-03",
    authors: ["S. Bradner"],
    abstract:
      "In many standards track documents several words are used to signify the requirements in the specification. These words are often capitalized. This document defines these words as they should be interpreted in IETF documents.",
    updatedBy: ["8174"],
    keywords: ["requirements", "keywords", "MUST", "SHOULD"],
  },
]

type AudienceType = "policymaker" | "technical" | "newcomer"

interface RFCSearchProps {
  audience: AudienceType
  onRFCSelect?: (rfc: RFC) => void
}

export function RFCSearch({ audience, onRFCSelect }: RFCSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedRFC, setSelectedRFC] = useState<RFC | null>(null)

  const filteredRFCs = useMemo(() => {
    return mockRFCs.filter((rfc) => {
      const matchesSearch =
        rfc.number.includes(searchQuery) ||
        rfc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rfc.authors.some((author) => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        rfc.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = statusFilter === "all" || rfc.status === statusFilter
      const matchesCategory = categoryFilter === "all" || rfc.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [searchQuery, statusFilter, categoryFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Standards Track":
        return "bg-primary text-primary-foreground"
      case "BCP":
        return "bg-secondary text-secondary-foreground"
      case "Informational":
        return "bg-accent text-accent-foreground"
      case "Experimental":
        return "bg-muted text-muted-foreground"
      case "Historic":
        return "bg-destructive/20 text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Internet Standard":
        return "bg-primary text-primary-foreground"
      case "Proposed Standard":
        return "bg-secondary text-secondary-foreground"
      case "Best Current Practice":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getAudienceExplanation = (rfc: RFC) => {
    if (audience === "policymaker") {
      return `Policy Impact: This ${rfc.status} document affects internet governance and may have regulatory implications. Key areas include data privacy, security standards, and interoperability requirements.`
    } else if (audience === "technical") {
      return `Technical Details: This specification defines implementation requirements for ${rfc.keywords.join(", ")}. Review the normative references and security considerations sections for implementation guidance.`
    } else {
      return `Beginner Summary: This document is a ${rfc.status.toLowerCase()} that helps define how ${rfc.keywords[0] || "internet technologies"} work. It's ${rfc.category === "Internet Standard" ? "widely adopted" : "being developed"} by the internet community.`
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">RFC Search & Explanation</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by RFC number, title, author, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Standards Track">Standards Track</SelectItem>
                <SelectItem value="BCP">BCP</SelectItem>
                <SelectItem value="Informational">Informational</SelectItem>
                <SelectItem value="Experimental">Experimental</SelectItem>
                <SelectItem value="Historic">Historic</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Internet Standard">Internet Standard</SelectItem>
                <SelectItem value="Proposed Standard">Proposed Standard</SelectItem>
                <SelectItem value="Best Current Practice">Best Current Practice</SelectItem>
                <SelectItem value="Informational">Informational</SelectItem>
                <SelectItem value="Experimental">Experimental</SelectItem>
                <SelectItem value="Historic">Historic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredRFCs.length} RFC{filteredRFCs.length !== 1 ? "s" : ""} found
          </p>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </Button>
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredRFCs.map((rfc) => (
              <Card key={rfc.number} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          RFC {rfc.number}
                        </Badge>
                        <Badge className={getStatusColor(rfc.status)}>{rfc.status}</Badge>
                        <Badge variant="secondary" className={getCategoryColor(rfc.category)}>
                          {rfc.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">{rfc.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {rfc.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {rfc.authors.length} author{rfc.authors.length !== 1 ? "s" : ""}
                        </div>
                        {rfc.workingGroup && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {rfc.workingGroup} WG
                          </div>
                        )}
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRFC(rfc)}>
                          <Info className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            RFC {rfc.number}: {rfc.title}
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ExternalLink className="w-4 h-4" />
                              View Full Text
                            </Button>
                          </DialogTitle>
                          <DialogDescription>{getAudienceExplanation(rfc)}</DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="relationships">Relationships</TabsTrigger>
                            <TabsTrigger value="metadata">Metadata</TabsTrigger>
                            <TabsTrigger value="explanation">Explanation</TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview" className="space-y-4">
                            <div className="space-y-2">
                              <h4 className="font-medium">Abstract</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">{rfc.abstract}</p>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium">Authors</h4>
                              <div className="flex flex-wrap gap-2">
                                {rfc.authors.map((author, index) => (
                                  <Badge key={index} variant="outline">
                                    {author}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium">Keywords</h4>
                              <div className="flex flex-wrap gap-2">
                                {rfc.keywords.map((keyword, index) => (
                                  <Badge key={index} variant="secondary">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="relationships" className="space-y-4">
                            {rfc.obsoletes && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-destructive">Obsoletes</h4>
                                <div className="flex flex-wrap gap-2">
                                  {rfc.obsoletes.map((obsoleted) => (
                                    <Badge key={obsoleted} variant="destructive">
                                      RFC {obsoleted}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {rfc.obsoletedBy && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-destructive">Obsoleted By</h4>
                                <div className="flex flex-wrap gap-2">
                                  {rfc.obsoletedBy.map((obsoleter) => (
                                    <Badge key={obsoleter} variant="destructive">
                                      RFC {obsoleter}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {rfc.updates && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-secondary">Updates</h4>
                                <div className="flex flex-wrap gap-2">
                                  {rfc.updates.map((updated) => (
                                    <Badge key={updated} variant="secondary">
                                      RFC {updated}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {rfc.updatedBy && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-secondary">Updated By</h4>
                                <div className="flex flex-wrap gap-2">
                                  {rfc.updatedBy.map((updater) => (
                                    <Badge key={updater} variant="secondary">
                                      RFC {updater}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <Button variant="outline" className="gap-2 bg-transparent">
                              <GitCompare className="w-4 h-4" />
                              Compare Versions
                            </Button>
                          </TabsContent>

                          <TabsContent value="metadata" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">Status</h4>
                                <Badge className={getStatusColor(rfc.status)}>{rfc.status}</Badge>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Category</h4>
                                <Badge className={getCategoryColor(rfc.category)}>{rfc.category}</Badge>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Publication Date</h4>
                                <p className="text-sm">{rfc.date}</p>
                              </div>

                              {rfc.workingGroup && (
                                <div className="space-y-2">
                                  <h4 className="font-medium">Working Group</h4>
                                  <Badge variant="outline">{rfc.workingGroup}</Badge>
                                </div>
                              )}

                              {rfc.area && (
                                <div className="space-y-2">
                                  <h4 className="font-medium">Area</h4>
                                  <p className="text-sm">{rfc.area}</p>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="explanation" className="space-y-4">
                            <div className="space-y-4">
                              <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-medium mb-2">
                                  {audience === "policymaker"
                                    ? "Policy Perspective"
                                    : audience === "technical"
                                      ? "Technical Perspective"
                                      : "Beginner-Friendly Explanation"}
                                </h4>
                                <p className="text-sm leading-relaxed">{getAudienceExplanation(rfc)}</p>
                              </div>

                              {audience === "newcomer" && (
                                <div className="space-y-2">
                                  <h4 className="font-medium">Key Terms</h4>
                                  <div className="space-y-2">
                                    {rfc.keywords.slice(0, 3).map((keyword, index) => (
                                      <div key={index} className="p-2 bg-card border rounded">
                                        <span className="font-medium">{keyword}</span>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Click to learn more about this concept
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="line-clamp-2">{rfc.abstract}</CardDescription>

                  {(rfc.obsoletes || rfc.updatedBy) && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      {rfc.obsoletes && (
                        <Badge variant="destructive" className="text-xs">
                          Obsoletes RFC {rfc.obsoletes.join(", ")}
                        </Badge>
                      )}
                      {rfc.updatedBy && (
                        <Badge variant="secondary" className="text-xs">
                          Updated by RFC {rfc.updatedBy.join(", ")}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
