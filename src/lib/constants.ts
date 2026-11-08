import { CourseInfo, DiagnosticQuestion } from '@/types';

export const STUDIO_CONFIG = {
  name: 'Cognitive Hub',
  tagline: 'Exclusive 3-Desk Micro-Studio for CS & ICT',
  whatsappNumber: '+8801963341868',
  whatsappFormatted: '+880 1963-341868',
  location: 'Dhanmondi / Dhaka Micro-Studio Suite',
  hours: 'Fri - Wed: 9:00 AM – 9:00 PM',
  bkashMerchantNumber: '01963-341868',
  nagadMerchantNumber: '01963-341868',
  holdDurationHours: 24,
  hardDeskLimit: 3,
};

export const COURSES: Record<string, CourseInfo> = {
  '0478': {
    code: '0478',
    board: 'Cambridge',
    title: 'IGCSE Computer Science',
    level: 'Cambridge IGCSE',
    description:
      'Rigorous foundational computer systems, boolean logic, data representation, Python programming, and automated pseudocode mastery with Paper 1 & Paper 2 focus.',
    practicalFocus: ['Python 3 Algorithmics', 'Cambridge Pseudocode', 'Logic Gate Diagrams', 'Trace Tables'],
    targetSeries: ['May/June 2027', 'Oct/Nov 2026', 'May/June 2026'],
    monthlyFeeBDT: 8500,
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/30',
  },
  '9618': {
    code: '9618',
    board: 'Cambridge',
    title: 'AS & A Level Computer Science',
    level: 'Cambridge International A Level',
    description:
      'Advanced OOP, data structures (linked lists, binary trees), assembly language, processor architecture, and Paper 4 Python live hands-on coding mastery.',
    practicalFocus: ['Paper 4 Python Practical', 'OOP & Abstract Data Types', 'Recursion & Big-O', 'SQL & Normalization'],
    targetSeries: ['May/June 2027', 'Oct/Nov 2026', 'May/June 2026'],
    monthlyFeeBDT: 10500,
    badgeColor: 'border-violet-500/40 text-violet-300 bg-violet-950/30',
  },
  '4CP0': {
    code: '4CP0',
    board: 'Pearson Edexcel',
    title: 'International GCSE Computer Science',
    level: 'Edexcel IGCSE',
    description:
      'Paper 1 principles of computer science paired with Paper 2 onscreen Python programming under real examination environment conditions.',
    practicalFocus: ['Onscreen Paper 2 Python', 'Algorithmic Problem Solving', 'Subroutines & Validation', 'Binary Logic'],
    targetSeries: ['May/June 2027', 'Jan 2027', 'May/June 2026'],
    monthlyFeeBDT: 8500,
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/30',
  },
  '4IT1': {
    code: '4IT1',
    board: 'Pearson Edexcel',
    title: 'International GCSE ICT',
    level: 'Edexcel IGCSE ICT',
    description:
      'Paper 1 theory of digital systems coupled with Paper 2 practical software mastery in MS Access relational DBs, advanced Excel modelling, and HTML/CSS.',
    practicalFocus: ['MS Access Relational DB & SQL', 'Advanced Excel Formulae', 'HTML5/CSS Web Authoring', 'Vector Graphics'],
    targetSeries: ['May/June 2027', 'Nov 2026', 'May/June 2026'],
    monthlyFeeBDT: 8500,
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/30',
  },
};

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // 0478
  {
    id: 'diag-0478-1',
    courseCode: '0478',
    question: 'In 8-bit Two’s Complement representation, what is the value of 1111 0000 in denary?',
    options: ['-16', '-240', '+240', '-112'],
    correctAnswer: 0,
    explanation: 'The MSB represents -128. -128 + 64 + 32 + 16 = -16.',
    category: 'data-representation',
  },
  {
    id: 'diag-0478-2',
    courseCode: '0478',
    question: 'Which logic gate produces output 0 ONLY when both inputs are 1, and 1 in all other cases?',
    options: ['NAND', 'NOR', 'XOR', 'AND'],
    correctAnswer: 0,
    explanation: 'NAND is the negation of AND: output is 0 only when both inputs A and B are 1.',
    category: 'logic',
  },
  {
    id: 'diag-0478-3',
    courseCode: '0478',
    question: 'In Cambridge pseudocode, what does the expression `17 MOD 5` evaluate to?',
    options: ['2', '3', '3.4', '1'],
    correctAnswer: 0,
    explanation: '17 divided by 5 is 3 with remainder 2. MOD gives the integer remainder.',
    category: 'problem-solving',
  },

  // 9618
  {
    id: 'diag-9618-1',
    courseCode: '9618',
    question: 'In Object-Oriented Programming (Paper 4), which principle prevents direct external access to an object’s attributes?',
    options: ['Encapsulation', 'Polymorphism', 'Inheritance', 'Static Typing'],
    correctAnswer: 0,
    explanation: 'Encapsulation restricts direct attribute access via private members and public getter/setter methods.',
    category: 'architecture',
  },
  {
    id: 'diag-9618-2',
    courseCode: '9618',
    question: 'When traversing a Binary Search Tree (BST), which traversal order produces keys in strictly ascending sorted order?',
    options: ['In-order traversal', 'Pre-order traversal', 'Post-order traversal', 'Breadth-first search'],
    correctAnswer: 0,
    explanation: 'In-order traversal visits left subtree, root node, then right subtree, sorting keys in ascending order.',
    category: 'problem-solving',
  },
  {
    id: 'diag-9618-3',
    courseCode: '9618',
    question: 'In the von Neumann architecture, which CPU register holds the address of the next instruction to be fetched?',
    options: ['Program Counter (PC)', 'Memory Data Register (MDR)', 'Current Instruction Register (CIR)', 'Accumulator (ACC)'],
    correctAnswer: 0,
    explanation: 'The PC stores the memory address of the next sequential instruction.',
    category: 'architecture',
  },

  // 4CP0
  {
    id: 'diag-4CP0-1',
    courseCode: '4CP0',
    question: 'What is the time complexity of searching for an element in an unsorted array of size N using Linear Search?',
    options: ['O(N)', 'O(log N)', 'O(1)', 'O(N^2)'],
    correctAnswer: 0,
    explanation: 'Linear search checks each element one by one, scaling linearly with N.',
    category: 'problem-solving',
  },
  {
    id: 'diag-4CP0-2',
    courseCode: '4CP0',
    question: 'In Python, what is the output of `len([x for x in range(10) if x % 3 == 0])`?',
    options: ['4 (0, 3, 6, 9)', '3 (3, 6, 9)', '5', '10'],
    correctAnswer: 0,
    explanation: 'The multiples of 3 in range(10) are 0, 3, 6, 9, which is 4 elements.',
    category: 'problem-solving',
  },

  // 4IT1
  {
    id: 'diag-4IT1-1',
    courseCode: '4IT1',
    question: 'In relational database design (MS Access), which field ensures every row is uniquely identifiable?',
    options: ['Primary Key', 'Foreign Key', 'Index Flag', 'Composite Filter'],
    correctAnswer: 0,
    explanation: 'A Primary Key enforces unique entity identification and integrity.',
    category: 'data-representation',
  },
  {
    id: 'diag-4IT1-2',
    courseCode: '4IT1',
    question: 'In Excel spreadsheet modelling, what symbol is used to create an absolute cell reference that does not change when copied?',
    options: ['$', '#', '%', '&'],
    correctAnswer: 0,
    explanation: 'The dollar sign (e.g. $A$1) locks row and column coordinates.',
    category: 'problem-solving',
  },
];
