import type { Syllabus } from './types';

export const allSyllabi: Syllabus[] = [
  {
    level: '0.0',
    subjects: {
      'Bengali': {
        marks: 30,
        topics: [
          'শিক্ষা ও মনুষত্ব্য - কাজী মোতাহের হোসেন চৌধুরী',
          'বই পড়া - প্রমথ চৌধুরী',
        ],
      },
      'English': {
        marks: 30,
        topics: ['IPA', 'A1 Vocabulary Book'],
      },
    }
  },
  {
    level: '2.1',
    subjects: {
      'Bengali': {
        marks: 40,
        topics: [
          'আমার পথ - কাজী নজরুল ইসলাম',
          'জীবন ও বৃক্ষ - মোতাহের হোসেন চৌধুরী',
        ],
      },
      'English': {
        marks: 40,
        topics: ['B1 Vocabulary', 'Advanced Grammar'],
      },
    }
  },
  {
    level: '2.2',
    subjects: {
        'Bengali': {
            marks: 40,
            topics: [
                'আহ্বান - বিভূতিভূষণ বন্দ্যোপাধ্যায়',
                'আমার সন্তান - ভারতচন্দ্র রায়গুণাকর'
            ]
        },
        'English': {
            marks: 40,
            topics: [
                'Figurative Language',
                'B1 Reading Comprehension'
            ]
        }
    }
  }
  // More syllabi can be added here following the same structure
];
