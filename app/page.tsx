"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Users,
  FileText,
  BookOpen,
  Search,
  Bell,
  Calendar,
  Send,
  Bot,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Loader2,
  Library,
  Network,
} from "lucide-react"
import { RFCSearch } from "@/components/rfc-search"
import { WorkingGroupDashboard } from "@/components/working-group-dashboard"
import { NotificationsSystem } from "@/components/notifications-system"

type AudienceType = "policymaker" | "technical" | "newcomer" | null

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "text" | "rfc-summary" | "working-group" | "glossary"
  metadata?: {
    rfcNumber?: string
    workingGroup?: string
    category?: string
  }
}

export default function IETFChatbot() {
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>(null)

  const audienceOptions = [
    {
      type: "policymaker" as const,
      title: "Policymaker",
      description: "Get plain-language summaries and governance insights",
      icon: Users,
      features: ["RFC summaries in plain language", "Policy-relevant updates", "High-level event outcomes"],
      color: "bg-primary text-primary-foreground",
    },
    {
      type: "technical" as const,
      title: "Technical Professional",
      description: "Access detailed technical information and documentation",
      icon: FileText,
      features: ["Full RFC access with status", "Version comparisons", "Working Group intelligence"],
      color: "bg-secondary text-secondary-foreground",
    },
    {
      type: "newcomer" as const,
      title: "Newcomer",
      description: "Learn IETF processes with guided onboarding",
      icon: BookOpen,
      features: ["Interactive glossary", "Guided onboarding", "Suggested learning paths"],
      color: "bg-accent text-accent-foreground",
    },
  ]

  if (!selectedAudience) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">IETF AI Assistant</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your personalized guide to Internet Engineering Task Force documents, processes, and activities
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-8">Choose your role to get started</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {audienceOptions.map((option) => {
                const IconComponent = option.icon
                return (
                  <Card
                    key={option.type}
                    className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
                    onClick={() => setSelectedAudience(option.type)}
                  >
                    <CardHeader className="text-center">
                      <div
                        className={`w-16 h-16 rounded-full ${option.color} flex items-center justify-center mx-auto mb-4`}
                      >
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <CardTitle className="text-xl">{option.title}</CardTitle>
                      <CardDescription className="text-sm">{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {option.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">Not sure which role fits you best?</p>
              <Button variant="outline" onClick={() => setSelectedAudience("newcomer")} className="gap-2">
                <BookOpen className="w-4 h-4" />
                Start with Newcomer Guide
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <ChatInterface audience={selectedAudience} onBack={() => setSelectedAudience(null)} />
}

function ChatInterface({ audience, onBack }: { audience: AudienceType; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showRFCSearch, setShowRFCSearch] = useState(false)
  const [showWGDashboard, setShowWGDashboard] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const audienceConfig = {
    policymaker: {
      title: "Policymaker Assistant",
      color: "bg-primary text-primary-foreground",
      quickActions: ["Latest Policy Updates", "RFC Summaries", "Governance Changes", "Meeting Outcomes"],
      welcomeMessage:
        "Welcome! I'm here to help you understand IETF developments from a policy perspective. I can provide plain-language summaries of technical standards and their governance implications.",
    },
    technical: {
      title: "Technical Assistant",
      color: "bg-secondary text-secondary-foreground",
      quickActions: ["Search RFCs", "Working Groups", "Draft Status", "Version Compare"],
      welcomeMessage:
        "Hello! I'm your technical guide to IETF standards. I can help you navigate RFCs, track working group activities, and understand technical specifications in detail.",
    },
    newcomer: {
      title: "Learning Assistant",
      color: "bg-accent text-accent-foreground",
      quickActions: ["IETF Basics", "Glossary", "Learning Path", "Getting Started"],
      welcomeMessage:
        "Hi there! New to IETF? I'm here to help you learn the basics. I can explain concepts, guide you through processes, and suggest learning paths tailored to your interests.",
    },
  }

  const config = audienceConfig[audience!]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: config.welcomeMessage,
        timestamp: new Date(),
        type: "text",
      }
      setMessages([welcomeMessage])
    }
  }, [audience])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, audience }),
      })
      if (!res.ok) {
        throw new Error(`API error ${res.status}`)
      }
      const data = (await res.json()) as { content?: string }
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || generateAudienceResponse(input, audience!),
        timestamp: new Date(),
        type: getResponseType(input),
        metadata: getResponseMetadata(input),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (e) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I couldn't reach the model right now. Please set OPENROUTER_API_KEY in .env.local and try again.",
        timestamp: new Date(),
        type: "text",
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const generateAudienceResponse = (query: string, audienceType: AudienceType): string => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("rfc") || lowerQuery.includes("standard")) {
      if (audienceType === "policymaker") {
        return "Here's a policy-focused summary: RFC 9110 modernizes HTTP semantics, impacting web privacy and data governance. Key policy implications include enhanced user consent mechanisms and improved data protection standards. This affects how organizations handle user data and comply with privacy regulations."
      } else if (audienceType === "technical") {
        return "RFC 9110 (HTTP Semantics) replaces RFC 2616 and introduces several technical changes:\n\n• Clarifies HTTP method semantics\n• Updates caching behavior\n• Defines new status codes\n• Improves security considerations\n\nStatus: Standards Track (Proposed Standard)\nObsoletes: RFC 2616, RFC 7230-7235"
      } else {
        return "Let me explain RFCs simply: RFC stands for 'Request for Comments' - these are the documents that define how the internet works! Think of them as instruction manuals for internet protocols. RFC 9110, for example, explains how web browsers and servers communicate. Would you like me to explain any specific part?"
      }
    }

    if (lowerQuery.includes("working group") || lowerQuery.includes("wg")) {
      if (audienceType === "policymaker") {
        return "Working Groups are where IETF policy decisions are made. Currently active groups include Privacy Enhancements (PEARG) focusing on user privacy, and Security Area groups addressing cybersecurity standards. These groups directly influence internet governance and regulatory compliance."
      } else if (audienceType === "technical") {
        return "Active Working Groups by area:\n\n**Security Area:**\n• TLS (Transport Layer Security)\n• OAUTH (Web Authorization)\n• CFRG (Crypto Forum Research)\n\n**Internet Area:**\n• 6MAN (IPv6 Maintenance)\n• DNSOP (DNS Operations)\n\nEach WG has GitHub repos, mailing lists, and regular meetings. Would you like details on a specific group?"
      } else {
        return "Working Groups are like committees that focus on specific internet technologies! For example, the TLS Working Group makes sure your online shopping is secure, while the DNS Working Group ensures websites load correctly. Each group has experts who collaborate to create standards. Want to learn about a specific area?"
      }
    }

    if (audienceType === "policymaker") {
      return "I can help you understand IETF standards from a policy perspective. Try asking about specific RFCs, governance changes, or policy implications of technical standards."
    } else if (audienceType === "technical") {
      return "I'm here to provide detailed technical information about IETF standards. Ask me about specific RFCs, working group activities, or technical specifications."
    } else {
      return "I'm here to help you learn about IETF! Try asking about basic concepts, specific technologies, or how internet standards are created. What would you like to explore?"
    }
  }

  const getResponseType = (query: string): Message["type"] => {
    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes("rfc")) return "rfc-summary"
    if (lowerQuery.includes("working group") || lowerQuery.includes("wg")) return "working-group"
    if (lowerQuery.includes("what is") || lowerQuery.includes("define")) return "glossary"
    return "text"
  }

  const getResponseMetadata = (query: string): Message["metadata"] => {
    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes("rfc 9110")) {
      return { rfcNumber: "9110", category: "Standards Track" }
    }
    if (lowerQuery.includes("tls")) {
      return { workingGroup: "TLS", category: "Security" }
    }
    return {}
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const closeAllPanels = () => {
    setShowRFCSearch(false)
    setShowWGDashboard(false)
    setShowNotifications(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                ← Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{config.title}</h1>
                <Badge className={config.color}>{audience?.charAt(0).toUpperCase() + audience?.slice(1)}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showRFCSearch ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setShowRFCSearch(!showRFCSearch)
                  if (!showRFCSearch) closeAllPanels()
                  setShowWGDashboard(false)
                  setShowNotifications(false)
                }}
              >
                <Library className="w-4 h-4" />
              </Button>
              <Button
                variant={showWGDashboard ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setShowWGDashboard(!showWGDashboard)
                  if (!showWGDashboard) closeAllPanels()
                  setShowRFCSearch(false)
                  setShowNotifications(false)
                }}
              >
                <Network className="w-4 h-4" />
              </Button>
              <Button
                variant={showNotifications ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  if (!showNotifications) closeAllPanels()
                  setShowRFCSearch(false)
                  setShowWGDashboard(false)
                }}
              >
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {config.quickActions.map((action) => (
              <Button
                key={action}
                variant="secondary"
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setInput(action)}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* RFC Search Panel */}
      {showRFCSearch && (
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <RFCSearch
              audience={audience!}
              onRFCSelect={(rfc) => {
                setInput(`Tell me about RFC ${rfc.number}: ${rfc.title}`)
                setShowRFCSearch(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Working Group Dashboard Panel */}
      {showWGDashboard && (
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <WorkingGroupDashboard
              audience={audience!}
              onWorkingGroupSelect={(wg) => {
                setInput(`Tell me about the ${wg.acronym} working group and their work on ${wg.hotTopics[0]}`)
                setShowWGDashboard(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <NotificationsSystem
              audience={audience!}
              onNotificationClick={(notification) => {
                if (notification.metadata?.rfcNumber) {
                  setInput(`Tell me about RFC ${notification.metadata.rfcNumber}`)
                } else if (notification.metadata?.workingGroup) {
                  setInput(`What's new with the ${notification.metadata.workingGroup} working group?`)
                } else {
                  setInput(`Tell me more about: ${notification.title}`)
                }
                setShowNotifications(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} audience={audience!} />
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card text-card-foreground border rounded-lg px-4 py-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about RFCs, Working Groups, or IETF processes..."
              className="flex-1 min-h-[44px] max-h-32 resize-none bg-input focus:outline-none focus:ring-2 focus:ring-ring"
              rows={1}
            />
            <Button onClick={handleSendMessage} disabled={!input.trim() || isTyping} className="gap-2">
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message, audience }: { message: Message; audience: AudienceType }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground rounded-lg px-4 py-3 max-w-[80%]">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="whitespace-pre-wrap">{message.content}</p>
              <div className="flex items-center justify-end gap-2 mt-2 text-xs opacity-70">
                <Clock className="w-3 h-3" />
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="bg-card text-card-foreground border rounded-lg px-4 py-3 max-w-[80%]">
        <div className="flex items-start gap-2">
          <Bot className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
          <div className="flex-1">
            {message.metadata?.rfcNumber && (
              <div className="mb-2">
                <Badge variant="secondary" className="text-xs">
                  RFC {message.metadata.rfcNumber}
                </Badge>
                {message.metadata.category && (
                  <Badge variant="outline" className="text-xs ml-1">
                    {message.metadata.category}
                  </Badge>
                )}
              </div>
            )}

            {message.metadata?.workingGroup && (
              <div className="mb-2">
                <Badge variant="secondary" className="text-xs">
                  {message.metadata.workingGroup} WG
                </Badge>
                {message.metadata.category && (
                  <Badge variant="outline" className="text-xs ml-1">
                    {message.metadata.category}
                  </Badge>
                )}
              </div>
            )}

            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatTimestamp(message.timestamp)}
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-6 px-2 text-xs">
                  {copied ? "Copied!" : <Copy className="w-3 h-3" />}
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
