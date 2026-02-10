"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Phone, 
  Clock, 
  Calendar, 
  Search, 
  Send, 
  Star, 
  Headphones,
  Mic,
  Video,
  Download,
  Play,
  Pause
} from "lucide-react";
import Navigation from "./Navigator";

const ChatSessions = () => {
  // Color scheme
  const colors = {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
    mediumPurple: "#3D2B56",
  };

  // Dummy chat sessions data
  const [chatSessions, setChatSessions] = useState([
    {
      id: 1,
      psychicId: 1,
      psychicName: "KRS",
      psychicImage: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w-150&h=150&fit=crop&crop=face",
      specialty: "Astrologer",
      lastMessage: "Your life path number suggests great success in creative fields.",
      lastMessageTime: "10:30 AM",
      unreadCount: 3,
      totalMessages: 145,
      sessionDuration: "45m 22s",
      sessionDate: "2024-01-15",
      sessionType: "chat",
      status: "active",
      creditsUsed: 25.50,
      rating: 4.8
    },
    {
      id: 2,
      psychicId: 2,
      psychicName: "Arkana",
      psychicImage: "https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257?w=150&h=150&fit=crop&crop=face",
      specialty: "Tarot Master",
      lastMessage: "The cards show a significant change coming in your career path.",
      lastMessageTime: "Yesterday",
      unreadCount: 0,
      totalMessages: 89,
      sessionDuration: "32m 15s",
      sessionDate: "2024-01-14",
      sessionType: "audio",
      status: "active",
      creditsUsed: 28.75,
      recordingUrl: "/recordings/session2.mp3",
      rating: 4.9
    },
    {
      id: 3,
      psychicId: 3,
      psychicName: "Numeron",
      psychicImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
      specialty: "Numerology Expert",
      lastMessage: "Your destiny number aligns perfectly with entrepreneurship.",
      lastMessageTime: "2 days ago",
      unreadCount: 0,
      totalMessages: 67,
      sessionDuration: "28m 10s",
      sessionDate: "2024-01-12",
      sessionType: "audio",
      status: "completed",
      creditsUsed: 35.20,
      recordingUrl: "/recordings/session3.mp4",
      rating: 4.7
    },
    {
      id: 4,
      psychicId: 4,
      psychicName: "Amoura",
      psychicImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      specialty: "Love Specialist",
      lastMessage: "Your compatibility score with them is 85% - very promising!",
      lastMessageTime: "3 days ago",
      unreadCount: 1,
      totalMessages: 112,
      sessionDuration: "51m 45s",
      sessionDate: "2024-01-10",
      sessionType: "chat",
      status: "completed",
      creditsUsed: 28.90,
      rating: 4.5
    },
    {
      id: 5,
      psychicId: 5,
      psychicName: "Serena",
      psychicImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      specialty: "Intuitive Empath",
      lastMessage: "I sense you need to focus on self-care this week.",
      lastMessageTime: "1 week ago",
      unreadCount: 0,
      totalMessages: 34,
      sessionDuration: "19m 30s",
      sessionDate: "2024-01-05",
      sessionType: "audio",
      status: "completed",
      creditsUsed: 19.85,
      recordingUrl: "/recordings/session5.mp3",
      rating: 4.6
    },
    {
      id: 6,
      psychicId: 6,
      psychicName: "Zenith",
      psychicImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      specialty: "Spiritual Guide",
      lastMessage: "Meditation will help you connect with your inner self.",
      lastMessageTime: "2 weeks ago",
      unreadCount: 0,
      totalMessages: 42,
      sessionDuration: "25m 15s",
      sessionDate: "2023-12-28",
      sessionType: "video",
      status: "completed",
      creditsUsed: 32.50,
      recordingUrl: "/recordings/session6.mp4",
      rating: 4.9
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, completed
  const [sessionType, setSessionType] = useState("all"); // all, chat, audio, video

  const filteredSessions = chatSessions.filter(session => {
    const matchesSearch = session.psychicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || session.status === filter;
    const matchesType = sessionType === "all" || session.sessionType === sessionType;
    return matchesSearch && matchesFilter && matchesType;
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'audio': return <Headphones className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getSessionTypeColor = (type) => {
    switch (type) {
      case 'audio': return '#10B981';
      case 'video': return '#EF4444';
      default: return colors.antiqueGold;
    }
  };

  const totalCreditsUsed = chatSessions.reduce((sum, session) => sum + session.creditsUsed, 0);
  const activeSessions = chatSessions.filter(s => s.status === 'active').length;
  const totalMessages = chatSessions.reduce((sum, session) => sum + session.totalMessages, 0);
  const totalDuration = chatSessions.reduce((total, session) => {
    const [minutes, seconds] = session.sessionDuration.split('m ')[0].split('m')[0].split('s')[0].split('m ');
    return total + parseInt(minutes) + (parseInt(seconds) / 60);
  }, 0);

  return (
     <div className="px-2 sm:px-4" style={{ backgroundColor: colors.softIvory }}>
          <div className="max-w-7xl mx-auto pb-10">
            <Navigation />
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.deepPurple }}>
            Sessions History
          </h1>
          <p className="text-lg" style={{ color: colors.deepPurple + "CC" }}>
            Manage your chat, audio, and video sessions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-sm" style={{ backgroundColor: colors.lightGold + "40" }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Total Sessions</p>
                  <p className="text-2xl font-bold" style={{ color: colors.deepPurple }}>
                    {chatSessions.length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.antiqueGold + "20" }}>
                  <MessageCircle className="h-6 w-6" style={{ color: colors.antiqueGold }} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm" style={{ backgroundColor: colors.lightGold + "40" }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Active Chats</p>
                  <p className="text-2xl font-bold" style={{ color: colors.deepPurple }}>
                    {activeSessions}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm" style={{ backgroundColor: colors.lightGold + "40" }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Total Duration</p>
                  <p className="text-2xl font-bold" style={{ color: colors.deepPurple }}>
                    {Math.floor(totalDuration)}h {Math.round((totalDuration % 1) * 60)}m
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.antiqueGold + "20" }}>
                  <Clock className="h-6 w-6" style={{ color: colors.antiqueGold }} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm" style={{ backgroundColor: colors.lightGold + "40" }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Credits Used</p>
                  <p className="text-2xl font-bold" style={{ color: colors.deepPurple }}>
                    ${totalCreditsUsed.toFixed(2)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.antiqueGold + "20" }}>
                  <Star className="h-6 w-6" style={{ color: colors.antiqueGold }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Type Tabs */}
        <Tabs defaultValue="all" className="mb-6" onValueChange={setSessionType}>
          <TabsList className="grid w-full md:w-auto grid-cols-4 mb-4" 
            style={{ backgroundColor: colors.lightGold + "40" }}>
            <TabsTrigger value="all">All Sessions</TabsTrigger>
            <TabsTrigger value="chat">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="audio">
              <Headphones className="h-4 w-4 mr-2" />
              Audio
            </TabsTrigger>
          
          </TabsList>
        </Tabs>

        {/* Search and Filter */}
        <Card className="shadow-sm mb-6" style={{ backgroundColor: colors.lightGold + "20" }}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                  style={{ color: colors.deepPurple + "60" }} />
                <Input
                  placeholder="Search psychics or messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  style={{ 
                    backgroundColor: colors.softIvory,
                    borderColor: colors.antiqueGold + "40",
                    color: colors.deepPurple
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  size="sm"
                  style={filter === "all" ? {
                    backgroundColor: colors.antiqueGold,
                    color: colors.deepPurple
                  } : {
                    borderColor: colors.antiqueGold + "40",
                    color: colors.deepPurple
                  }}
                >
                  All
                </Button>
                <Button
                  variant={filter === "active" ? "default" : "outline"}
                  onClick={() => setFilter("active")}
                  size="sm"
                  style={filter === "active" ? {
                    backgroundColor: colors.antiqueGold,
                    color: colors.deepPurple
                  } : {
                    borderColor: colors.antiqueGold + "40",
                    color: colors.deepPurple
                  }}
                >
                  Active
                </Button>
                <Button
                  variant={filter === "completed" ? "default" : "outline"}
                  onClick={() => setFilter("completed")}
                  size="sm"
                  style={filter === "completed" ? {
                    backgroundColor: colors.antiqueGold,
                    color: colors.deepPurple
                  } : {
                    borderColor: colors.antiqueGold + "40",
                    color: colors.deepPurple
                  }}
                >
                  Completed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Sessions List */}
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="shadow-sm hover:shadow-md transition-shadow duration-300"
              style={{ backgroundColor: colors.lightGold + "20" }}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Psychic Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-14 w-14 border-2" style={{ borderColor: colors.antiqueGold }}>
                      <AvatarImage src={session.psychicImage} alt={session.psychicName} />
                      <AvatarFallback className="text-base font-semibold"
                        style={{ backgroundColor: colors.deepPurple, color: colors.softIvory }}>
                        {session.psychicName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold truncate text-lg" style={{ color: colors.deepPurple }}>
                          {session.psychicName}
                        </h3>
                        <Badge variant="outline" className="text-xs"
                          style={{ 
                            borderColor: getSessionTypeColor(session.sessionType),
                            backgroundColor: getSessionTypeColor(session.sessionType) + "20",
                            color: colors.deepPurple 
                          }}>
                          <span className="flex items-center gap-1">
                            {getSessionTypeIcon(session.sessionType)}
                            {session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1)}
                          </span>
                        </Badge>
                        {session.status === "active" && (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            Live
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs"
                          style={{ 
                            backgroundColor: colors.antiqueGold + "20",
                            color: colors.deepPurple 
                          }}>
                          {session.specialty}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm"
                          style={{ color: colors.deepPurple + "CC" }}>
                          <Star className="h-3 w-3 fill-current" style={{ color: colors.antiqueGold }} />
                          {session.rating}
                        </div>
                      </div>
                      <p className="text-sm truncate mt-1" style={{ color: colors.deepPurple + "CC" }}>
                        {session.lastMessage}
                      </p>
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1" style={{ color: colors.deepPurple + "CC" }}>
                        <Clock className="h-3 w-3" />
                        <span>Duration</span>
                      </div>
                      <div className="font-semibold" style={{ color: colors.deepPurple }}>
                        {session.sessionDuration}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1" style={{ color: colors.deepPurple + "CC" }}>
                        <Calendar className="h-3 w-3" />
                        <span>Date</span>
                      </div>
                      <div className="font-semibold" style={{ color: colors.deepPurple }}>
                        {formatDate(session.sessionDate)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: colors.deepPurple + "CC" }}>Credits</div>
                      <div className="font-semibold" style={{ color: colors.deepPurple }}>
                        ${session.creditsUsed.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: colors.deepPurple + "CC" }}>Messages</div>
                      <div className="font-semibold" style={{ color: colors.deepPurple }}>
                        {session.totalMessages}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredSessions.length === 0 && (
          <Card className="shadow-sm text-center py-12" style={{ backgroundColor: colors.lightGold + "20" }}>
            <CardContent>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ backgroundColor: colors.lightGold }}>
                <MessageCircle className="h-8 w-8" style={{ color: colors.antiqueGold }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.deepPurple }}>
                No Sessions Found
              </h3>
              <p className="mb-4" style={{ color: colors.deepPurple + "CC" }}>
                {searchTerm 
                  ? 'No sessions match your search. Try different keywords.'
                  : 'Start a chat with a psychic to begin your journey.'}
              </p>
              <Button
                style={{ 
                  backgroundColor: colors.antiqueGold,
                  color: colors.deepPurple
                }}
              >
                Browse Psychics
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChatSessions;