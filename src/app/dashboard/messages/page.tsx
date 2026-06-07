
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockUsers } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MessageCircle, Search, Send, ArrowLeft, Phone, Video, Paperclip, Camera, FileImage, Mic, Smile, UserX, ShieldAlert, MessageSquareQuote, ChevronDown, MoreVertical, Reply, Copy, ThumbsUp, Trash2, Check, CheckCheck, Clock, PhoneOff, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { User } from '@/lib/types';
import { IlbooksLogo } from '@/components/ilbooks-logo';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { currentUser } from '@/lib/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';


const allConversations = [
  {
    user: {
      id: 'ilbooks-admin',
      name: 'ILBooks',
      avatarUrl: 'ilbooks_logo', 
      level: 99,
      institution: 'Bookworm Network',
      location: 'Digital Space',
      hobbies: [],
      isFollowing: true,
      isMutual: true,
      isAdmin: true,
    } as User,
    messages: [
      { id: 1, text: "Hello! How can I assist you today?", sender: 'ilbooks-admin', timestamp: '10:00 AM' },
    ],
    lastMessage: "Hello! How can I assist you today?",
    timestamp: "10:00 AM",
    unread: 0,
  },
  ...mockUsers.filter(u => u.id !== currentUser.id && u.isMutual).map((user, index) => ({
    user,
    messages: [
      { id: 1, text: "Hey, how are you?", sender: user.id, timestamp: '9:30 AM'},
      { id: 2, text: "Doing great, thanks! Just finished a new book.", sender: currentUser.id, timestamp: '9:32 AM', status: 'delivered' as const}
    ],
    lastMessage: "Doing great, thanks! Just finished a new book.",
    timestamp: "9:32 AM",
    unread: index === 0 ? 2 : 0,
  }))
];

type Conversation = (typeof allConversations)[0];
type Message = Conversation['messages'][0];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isCallConfirmOpen, setIsCallConfirmOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState<'Audio' | 'Video' | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleSendVoiceMessage = () => {
    setIsRecording(false);
    setIsVoiceDialogOpen(false);
    toast({ title: "Voice message sent!" });
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "Attachment Ready",
        description: `File "${file.name}" will be sent with your message.`,
      });
    }
    if(e.target) e.target.value = '';
  };

  const truncateMessage = (message: string, maxLength = 20): string => {
    if (message.length <= maxLength) {
      return message;
    }
    return `${message.substring(0, maxLength)}....`;
  };

  useEffect(() => {
    if (isCameraDialogOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          if ((error as Error).name === 'NotAllowedError') {
             setHasCameraPermission(false);
             toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings.',
              });
          } else {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
          }
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCameraDialogOpen, toast]);

  useEffect(() => {
    setIsClient(true);
    const chatWithId = searchParams.get('chatWith');
    
    if (chatWithId) {
        const conversation = allConversations.find(c => c.user.id === chatWithId);

        if (conversation) {
          if (conversation.user.isMutual || conversation.user.isAdmin) {
            setSelectedConversation(conversation);
          } else {
             toast({
                title: "Cannot Chat",
                description: "You can only chat with mutual friends.",
                variant: "destructive"
            });
            router.push('/dashboard/messages', { scroll: false });
          }
        } else {
            router.push('/dashboard/messages', { scroll: false });
        }
    } else {
        setSelectedConversation(null);
    }
  }, [searchParams, router, toast]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [selectedConversation?.messages]);

  const handleSelectConversation = (conv: Conversation) => {
    if (conv.user.isMutual || conv.user.isAdmin) {
      setSelectedConversation(conv);
      router.push(`/dashboard/messages?chatWith=${conv.user.id}`, { scroll: false });
    } else {
        toast({
          title: "Cannot Chat",
          description: "You can only chat with mutual friends.",
          variant: "destructive"
      });
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedConversation) return;

      const newMsg: Message = {
          id: Date.now(),
          text: newMessage,
          sender: currentUser.id,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: 'sent' as const,
      };

      if (newMessage.trim() !== '') {
          const updatedConversation = {
              ...selectedConversation,
              messages: [...selectedConversation.messages, newMsg],
              lastMessage: newMsg.text,
              timestamp: newMsg.timestamp,
          };
  
          setSelectedConversation(updatedConversation);
          const convIndex = allConversations.findIndex(c => c.user.id === selectedConversation.user.id);
          if (convIndex > -1) {
              allConversations[convIndex] = updatedConversation;
          }
          setNewMessage('');
      }
  };

  const handleDeleteMessage = () => {
    if (!selectedConversation || messageToDelete === null) return;
    const updatedMessages = selectedConversation.messages.filter(m => m.id !== messageToDelete);
    const updatedConversation = {
        ...selectedConversation,
        messages: updatedMessages,
        lastMessage: updatedMessages.length > 0 ? updatedMessages[updatedMessages.length - 1].text : "Chat cleared",
    };
    setSelectedConversation(updatedConversation);
    const convIndex = allConversations.findIndex(c => c.user.id === selectedConversation.user.id);
    if (convIndex > -1) {
        allConversations[convIndex] = updatedConversation;
    }
    toast({ title: 'Message deleted!', variant: 'destructive' });
    setMessageToDelete(null);
  };

  const startCall = () => {
    setIsCallConfirmOpen(false);
    setIsCalling(true);
  };

  const endCall = () => {
    setIsCalling(false);
    setCallType(null);
  };

  if (!isClient) return null;

  return (
    <>
    {/* CALLING OVERLAY */}
    {isCalling && (
      <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center text-white p-6 animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col items-center gap-8 max-w-sm w-full text-center">
              <Avatar className="h-32 w-32 border-4 border-primary/20 ring-4 ring-primary/10">
                  <AvatarImage src={selectedConversation?.user.avatarUrl !== 'ilbooks_logo' ? selectedConversation?.user.avatarUrl : undefined} />
                  <AvatarFallback className="bg-primary/20 text-4xl">{selectedConversation?.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                  <h2 className="text-3xl font-bold font-headline">{selectedConversation?.user.name}</h2>
                  <p className="text-primary animate-pulse font-medium tracking-widest uppercase text-sm">
                      {callType === 'Video' ? 'Starting Video Call...' : 'Calling...'}
                  </p>
              </div>
              <div className="mt-10 flex gap-6">
                  <Button variant="destructive" size="icon" className="h-16 w-16 rounded-full shadow-lg hover:scale-105 transition-transform" onClick={endCall}>
                      <PhoneOff className="h-8 w-8" />
                  </Button>
              </div>
          </div>
      </div>
    )}

    <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Camera</DialogTitle>
          <DialogDescription>Take a photo to send in the chat.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCameraDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => toast({ title: "Photo captured!" })} disabled={!hasCameraPermission}>Take Picture</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <AlertDialog open={isCallConfirmOpen} onOpenChange={setIsCallConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="text-primary font-headline">Start {callType} Call?</AlertDialogTitle>
                <AlertDialogDescription>
                    Would you like to initiate a {callType?.toLowerCase()} call with {selectedConversation?.user.name}?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>No, Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={startCall} className="bg-primary hover:bg-primary/90">Yes, Start Call</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={messageToDelete !== null} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete this message from your view.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setMessageToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteMessage} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <Dialog open={isVoiceDialogOpen} onOpenChange={setIsVoiceDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Record Voice Message</DialogTitle>
                <DialogDescription>
                    {isRecording ? `Recording... (${recordingTime}s)` : "Click start to begin recording."}
                </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center items-center h-24">
                <Mic className={cn("w-12 h-12 text-primary transition-all", isRecording && "animate-pulse scale-110")}/>
            </div>
            <DialogFooter>
                {isRecording ? (
                    <>
                        <Button variant="destructive" onClick={() => setIsRecording(false)}>Cancel</Button>
                        <Button onClick={handleSendVoiceMessage}>Stop & Send</Button>
                    </>
                ) : (
                    <Button onClick={handleStartRecording}>Start Recording</Button>
                )}
            </DialogFooter>
        </DialogContent>
    </Dialog>
    
    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
    <input type="file" ref={imageInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

    <div className="flex bg-background h-[calc(100vh-8rem)] md:h-[calc(100vh-5.5rem)]">
      <aside className={cn("w-full md:w-80 lg:w-96 border-r flex-col", selectedConversation ? "hidden md:flex" : "flex")}>
        <div className="p-1 border-b flex items-center gap-1">
          <h1 className="text-xs font-bold font-headline px-2">Chat</h1>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search chats..." className="pl-8 h-7" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {allConversations.sort((a,b) => (a.user.isAdmin ? -1 : b.user.isAdmin ? 1 : 0)).map(conv => {
            const isIlbooks = conv.user.name === "ILBooks";
            return (
              <div
                key={conv.user.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectConversation(conv)}
                className={cn(
                  "flex items-center gap-3 p-2 border-b cursor-pointer transition-colors",
                  selectedConversation?.user.id === conv.user.id ? "bg-muted" : "hover:bg-muted/50",
                  isIlbooks && "sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b-2 border-primary"
                )}
              >
                <Avatar className="h-12 w-12 border flex-shrink-0">
                    { isIlbooks ? (
                    <AvatarFallback className="bg-card">
                        <IlbooksLogo className="h-8 w-8" />
                    </AvatarFallback>
                ) : (
                    <>
                    <AvatarImage src={conv.user.avatarUrl} alt={conv.user.name} />
                    <AvatarFallback>{conv.user.name.charAt(0)}</AvatarFallback>
                    </>
                )}
                </Avatar>
                <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="font-semibold font-headline truncate">{conv.user.name}</p>
                    {!isIlbooks && <p className="text-sm text-muted-foreground truncate">{truncateMessage(conv.lastMessage)}</p>}
                    {isIlbooks && <p className="text-xs text-primary font-bold">Admin Support</p>}
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{conv.timestamp}</p>
                </div>
              </div>
            )
          })}
        </ScrollArea>
      </aside>

      <main className={cn("flex-1 flex flex-col", selectedConversation ? "flex" : "hidden md:flex")}>
        {selectedConversation ? (
          <>
            <div className="p-1 border-b flex items-center gap-1">
                <Button variant="ghost" size="icon" className="md:hidden flex-shrink-0 h-8 w-8" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4"/>
                </Button>
                <Avatar className="h-8 w-8 border flex-shrink-0">
                    {selectedConversation.user.name === 'ILBooks' ? (
                        <AvatarFallback className="bg-card">
                            <IlbooksLogo className="h-6 w-6" />
                        </AvatarFallback>
                    ) : (
                        <>
                            <AvatarImage src={selectedConversation.user.avatarUrl !== 'ilbooks_logo' ? selectedConversation.user.avatarUrl : undefined} alt={selectedConversation.user.name} />
                            <AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                        </>
                    )}
                </Avatar>
                <div className="flex-grow min-w-0">
                    <h2 className="font-semibold text-sm font-headline leading-tight truncate">{selectedConversation.user.name}</h2>
                    <p className="text-xs text-muted-foreground leading-tight">
                        {selectedConversation.user.name === 'ILBooks' ? 'Admin Support' : `Level: ${selectedConversation.user.level.toFixed(1)}`}
                    </p>
                </div>
                <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => { setCallType('Audio'); setIsCallConfirmOpen(true); }}>
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => { setCallType('Video'); setIsCallConfirmOpen(true); }}>
                        <Video className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 p-2 sm:p-4 lg:p-6 bg-slate-50/50">
                <div className="space-y-4">
                    {selectedConversation.messages.map(msg => (
                    <div key={msg.id} className={cn("group flex w-full max-w-full items-end gap-2", msg.sender === currentUser.id && "justify-end")}>
                        <div className={cn("flex items-end gap-2", msg.sender === currentUser.id ? "flex-row-reverse" : "flex-row")}>
                            {msg.sender !== currentUser.id && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={selectedConversation.user.avatarUrl !== 'ilbooks_logo' ? selectedConversation.user.avatarUrl : undefined} />
                                <AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            )}
                            <div className="relative group/msg">
                                <div className={cn("max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] p-2 md:p-3 rounded-lg shadow-sm", msg.sender === currentUser.id ? "bg-primary/10" : "bg-card")}>
                                    <p className="break-words font-sans text-sm">{msg.text}</p>
                                    <div className="flex justify-end items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground">
                                        <span>{msg.timestamp}</span>
                                        {msg.sender === currentUser.id && (
                                            msg.status === 'delivered' ? <CheckCheck className="w-3 h-3 text-primary" /> : <Check className="w-3 h-3" />
                                        )}
                                    </div>
                                </div>
                                <div className={cn(
                                    "absolute top-0 transition-opacity",
                                    msg.sender === currentUser.id ? "-left-10" : "-right-10"
                                )}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align={msg.sender === currentUser.id ? "end" : "start"}>
                                            <DropdownMenuItem onClick={() => toast({ title: "Reply quote feature coming soon!" })}>
                                                <Reply className="mr-2 h-4 w-4" /> Reply
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                navigator.clipboard.writeText(msg.text);
                                                toast({ title: "Copied to clipboard" });
                                            }}>
                                                <Copy className="mr-2 h-4 w-4" /> Copy
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => setMessageToDelete(msg.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>
            
            <div className="px-1 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <div className={cn("flex items-center transition-all duration-300", isInputFocused ? "w-0 -ml-2 overflow-hidden opacity-0" : "w-auto ml-0 opacity-100")}>
                        <Button type="button" variant="ghost" size="icon" className="shrink-0 h-10 w-10" onClick={() => fileInputRef.current?.click()}><Paperclip className="w-5 h-5"/></Button>
                        <Button type="button" variant="ghost" size="icon" className="shrink-0 h-10 w-10 -ml-2" onClick={() => setIsCameraDialogOpen(true)}><Camera className="w-5 h-5"/></Button>
                    </div>
                    <div className="relative flex-1">
                    <Input 
                        ref={inputRef}
                        placeholder="Message" 
                        className="pr-10 h-9 rounded-full bg-muted" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                    />
                    </div>
                    <Button type="submit" aria-label="Send Message" className="shrink-0 h-9 w-9"><Send className="w-4 h-4"/></Button>
                </form>
            </div>
          </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4"/>
                    <p>Select a conversation to start chatting</p>
                </div>
            </div>
        )}
      </main>
    </div>
    </>
  );
}
