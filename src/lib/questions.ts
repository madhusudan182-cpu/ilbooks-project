import type { Question } from './types';

export const levelZeroQuestions: Question[] = [
  {
    id: 'q1-0.0-ben',
    level: '0.0',
    subject: 'Bengali',
    questionText: '‘শিক্ষা ও মনুষত্ব্য’ প্রবন্ধের লেখক কে?',
    answers: [
      { text: 'প্রমথ চৌধুরী', isCorrect: false },
      { text: 'কাজী মোতাহের হোসেন চৌধুরী', isCorrect: true },
      { text: 'রবীন্দ্রনাথ ঠাকুর', isCorrect: false },
      { text: 'কাজী নজরুল ইসলাম', isCorrect: false },
    ],
    explanation: '‘শিক্ষা ও মনুষত্ব্য’ প্রবন্ধটি লিখেছেন কাজী মোতাহের হোসেন চৌধুরী, যা তার ‘সংস্কৃতি কথা’ গ্রন্থ থেকে সংকলিত হয়েছে।',
  },
  {
    id: 'q2-0.0-ben',
    level: '0.0',
    subject: 'Bengali',
    questionText: '‘বই পড়া’ প্রবন্ধ অনুযায়ী, কোনটি ডেমোক্রেসির গুরুরা স্বীকার করেন?',
    answers: [
      { text: 'জ্ঞানের চেয়ে 돈 বড়', isCorrect: false },
      { text: 'সবাই সমান', isCorrect: false },
      { text: 'জ্ঞানের বিস্তার', isCorrect: false },
      { text: 'জোর করে শিক্ষা দেওয়া যায় না', isCorrect: true },
    ],
    explanation: 'প্রমথ চৌধুরী তার ‘বই পড়া’ প্রবন্ধে বলেছেন যে ডেমোক্রেসির গুরুরা স্বীকার করেন যে, জোর করে কাউকে শিক্ষা দেওয়া যায় না।',
  },
  {
    id: 'q3-0.0-eng',
    level: '0.0',
    subject: 'English',
    questionText: 'What does IPA stand for in linguistics?',
    answers: [
      { text: 'International Phonetic Alphabet', isCorrect: true },
      { text: 'International Phonetic Association', isCorrect: false },
      { text: 'Indian Phonetic Alphabet', isCorrect: false },
      { text: 'International Pronunciation assistance', isCorrect: false },
    ],
    explanation: 'IPA stands for the International Phonetic Alphabet, an alphabetic system of phonetic notation based primarily on the Latin script.',
  },
   {
    id: 'q4-0.0-eng',
    level: '0.0',
    subject: 'English',
    questionText: 'Which of the following is a common A1 level vocabulary word?',
    answers: [
      { text: 'Ubiquitous', isCorrect: false },
      { text: 'Apple', isCorrect: true },
      { text: 'Conspicuous', isCorrect: false },
      { text: 'Ostentatious', isCorrect: false },
    ],
    explanation: 'A1 is the beginner level in the Common European Framework of Reference for Languages (CEFR). "Apple" is a basic vocabulary word appropriate for this level.',
  },
];
