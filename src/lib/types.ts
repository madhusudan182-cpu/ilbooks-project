import type { LucideIcon } from "lucide-react";

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  level: number;
  institution: string;
  location: string;
  hobbies: string[];
  isFollowing: boolean;
  isMutual: boolean;
  isAdmin?: boolean;
};

export type Post = {
  id: string;
  author: User;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
};

export type Book = {
  id:string;
  title: string;
  author: string;
  price: number;
  coverUrl: string;
};

export type NavItem = {
  href: string;
  title: string;
  icon: LucideIcon;
  label?: string;
};

export type Answer = {
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  level: string;
  subject: 'Bengali' | 'English';
  questionText: string;
  answers: Answer[];
  explanation: string;
};

export type SyllabusTopic = {
  marks: number;
  topics: string[];
};

export type Syllabus = {
  level: string;
  subjects: {
    [subjectName: string]: SyllabusTopic;
  };
};
