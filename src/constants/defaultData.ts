import { Scenario } from '../types/scenario';

export const DEFAULT_SCENARIOS: Scenario[] = [
  // 1. 시나리오: 분배
  {
    id: 'scenario-1',
    scenarioName: '분배',
    semesters: [
      {
        id: 'sem-1-0',
        originalIndex: 0,
        name: '3학년 1학기',
        courses: [
          { id: 'c-1-0-1', type: 'JP', name: '해석학 1', credit: 3 },
          { id: 'c-1-0-2', type: 'JP', name: '수치해석개론', credit: 3 },
          { id: 'c-1-0-3', type: 'JS', name: '객체지향프로그래밍', credit: 3 },
          { id: 'c-1-0-4', type: 'JS', name: '수학적모델링', credit: 3 },
          { id: 'c-1-0-5', type: 'Eng', name: '중급영어토론', credit: 2 },
          { id: 'c-1-0-6', type: 'Jas', name: 'MOOC', credit: 2 },
        ],
      },
      {
        id: 'sem-1-1',
        originalIndex: 1,
        name: '3학년 여름방학',
        courses: [
          { id: 'c-1-1-1', type: 'GS', name: '러시아문화와예술', credit: 3 },
          { id: 'c-1-1-2', type: 'GS', name: '', credit: 3 },
        ],
      },
      {
        id: 'sem-1-2',
        originalIndex: 2,
        name: '3학년 2학기',
        courses: [
          { id: 'c-1-2-1', type: 'JS', name: '인공지능수학', credit: 3 },
          { id: 'c-1-2-2', type: 'JS', name: '금융공학개론', credit: 3 },
          { id: 'c-1-2-3', type: 'JS', name: '수학탐구', credit: 3 },
          { id: 'c-1-2-4', type: 'GS', name: '', credit: 3 },
          { id: 'c-1-2-5', type: 'Jas', name: '연세OC', credit: 2 },
          { id: 'c-1-2-6', type: 'Eng', name: '', credit: 2 },
        ],
      },
      {
        id: 'sem-1-3',
        originalIndex: 3,
        name: '3학년 겨울방학',
        courses: [
          { id: 'c-1-3-1', type: 'Eng', name: '', credit: 2 },
          { id: 'c-1-3-2', type: 'Eng', name: '', credit: 2 },
        ],
      },
      {
        id: 'sem-1-4',
        originalIndex: 4,
        name: '4학년 1학기',
        courses: [
          { id: 'c-1-4-1', type: 'JS', name: '알고리즘', credit: 3 },
          { id: 'c-1-4-2', type: 'JS', name: '데이터사이언스방법론', credit: 3 },
          { id: 'c-1-4-3', type: 'JS', name: '수학탐구', credit: 3 },
          { id: 'c-1-4-4', type: 'Jas', name: '연세 OC', credit: 2 },
          { id: 'c-1-4-5', type: 'PE', name: '', credit: 1 },
        ],
      },
      {
        id: 'sem-1-5',
        originalIndex: 5,
        name: '4학년 여름방학',
        courses: [],
      },
      {
        id: 'sem-1-6',
        originalIndex: 6,
        name: '4학년 2학기',
        courses: [
          { id: 'c-1-6-1', type: 'Jas', name: '단기유학', credit: 3 },
        ],
      },
      {
        id: 'sem-1-7',
        originalIndex: 7,
        name: '4학년 겨울방학',
        courses: [],
      },
      {
        id: 'sem-1-8',
        originalIndex: 8,
        name: '5학년 1학기',
        courses: [
          { id: 'c-1-8-1', type: 'Jas', name: '인공지능', credit: 3 },
          { id: 'c-1-8-2', type: 'Jas', name: 'MOOC', credit: 2 },
        ],
      },
      {
        id: 'sem-1-9',
        originalIndex: 9,
        name: '5학년 여름방학',
        courses: [],
      },
    ],
    activities: [
      { id: 'act-1-1', type: 'Research', name: 'UGRP', credit: 0, startSem: 0, endSem: 3 },
      { id: 'act-1-2', type: 'Cert', name: 'SQLD', credit: 0, startSem: 1, endSem: 1 },
      { id: 'act-1-3', type: 'Intern', name: 'SES', credit: 0, startSem: 5, endSem: 5 },
      { id: 'act-1-4', type: 'Intern', name: 'SES', credit: 0, startSem: 7, endSem: 7 },
      { id: 'act-1-5', type: 'Cert', name: '토익 스피킹', credit: 0, startSem: 4, endSem: 4 },
      { id: 'act-1-6', type: 'Cert', name: '투자자산운용사', credit: 0, startSem: 5, endSem: 5 },
      { id: 'act-1-7', type: 'Cert', name: '빅데이터 분석기사', credit: 0, startSem: 3, endSem: 3 },
    ],
  },

  // 2. 시나리오: 기본
  {
    id: 'scenario-2',
    scenarioName: '기본',
    semesters: [
      {
        id: 'sem-2-0',
        originalIndex: 0,
        name: '3학년 1학기',
        courses: [
          { id: 'c-2-0-1', type: 'JP', name: '해석학 1', credit: 3 },
          { id: 'c-2-0-2', type: 'JP', name: '수치해석개론', credit: 3 },
          { id: 'c-2-0-3', type: 'JS', name: '객체지향프로그래밍', credit: 3 },
          { id: 'c-2-0-4', type: 'JS', name: '수학적 모델링', credit: 3 },
          { id: 'c-2-0-5', type: 'Eng', name: '중급영어토론', credit: 2 },
          { id: 'c-2-0-6', type: 'Jas', name: 'MOOC', credit: 2 },
        ],
      },
      {
        id: 'sem-2-1',
        originalIndex: 1,
        name: '3학년 여름방학',
        courses: [],
      },
      {
        id: 'sem-2-2',
        originalIndex: 2,
        name: '3학년 2학기',
        courses: [
          { id: 'c-2-2-1', type: 'JS', name: '인공지능', credit: 3 },
          { id: 'c-2-2-2', type: 'JS', name: '금융공학개론', credit: 3 },
          { id: 'c-2-2-3', type: 'JS', name: '인공지능수학', credit: 3 },
          { id: 'c-2-2-4', type: 'JS', name: '수학탐구', credit: 3 },
          { id: 'c-2-2-5', type: 'Eng', name: '', credit: 2 },
          { id: 'c-2-2-6', type: 'Jas', name: '연세 OC', credit: 2 },
        ],
      },
      {
        id: 'sem-2-3',
        originalIndex: 3,
        name: '3학년 겨울방학',
        courses: [
          { id: 'c-2-3-1', type: 'Eng', name: '', credit: 2 },
          { id: 'c-2-3-2', type: 'Eng', name: '', credit: 2 },
        ],
      },
      {
        id: 'sem-2-4',
        originalIndex: 4,
        name: '4학년 1학기',
        courses: [
          { id: 'c-2-4-1', type: 'JS', name: '알고리즘', credit: 3 },
          { id: 'c-2-4-2', type: 'JS', name: '데이터사이언스방법론', credit: 3 },
          { id: 'c-2-4-3', type: 'Jas', name: '수리데이터사이언스', credit: 3 },
          { id: 'c-2-4-4', type: 'Jas', name: '수학탐구', credit: 3 },
          { id: 'c-2-4-5', type: 'Jas', name: '연세 OC', credit: 2 },
          { id: 'c-2-4-6', type: 'GS', name: '', credit: 3 },
          { id: 'c-2-4-7', type: 'PE', name: '', credit: 1 },
        ],
      },
      {
        id: 'sem-2-5',
        originalIndex: 5,
        name: '4학년 여름방학',
        courses: [],
      },
      {
        id: 'sem-2-6',
        originalIndex: 6,
        name: '4학년 2학기',
        courses: [
          { id: 'c-2-6-1', type: 'GS', name: '', credit: 3 },
          { id: 'c-2-6-2', type: 'Jas', name: 'MOOC', credit: 2 },
        ],
      },
      {
        id: 'sem-2-7',
        originalIndex: 7,
        name: '4학년 겨울방학',
        courses: [],
      },
    ],
    activities: [
      { id: 'act-2-1', type: 'Intern', name: 'SES', credit: 0, startSem: 1, endSem: 1 },
      { id: 'act-2-2', type: 'Intern', name: 'SES', credit: 0, startSem: 5, endSem: 5 },
      { id: 'act-2-3', type: 'Research', name: 'UGRP', credit: 0, startSem: 0, endSem: 3 },
      { id: 'act-2-4', type: 'Cert', name: 'SQLD', credit: 0, startSem: 1, endSem: 1 },
      { id: 'act-2-5', type: 'Cert', name: '토익 스피킹', credit: 0, startSem: 4, endSem: 4 },
      { id: 'act-2-6', type: 'Cert', name: '투자자산운용사', credit: 0, startSem: 5, endSem: 5 },
      { id: 'act-2-7', type: 'Cert', name: '빅데이터 분석기사', credit: 0, startSem: 3, endSem: 3 },
    ],
  },

  // 3. 시나리오: 빠른 졸업
  {
    id: 'scenario-3',
    scenarioName: '빠른 졸업',
    semesters: [
      {
        id: 'sem-3-0',
        originalIndex: 0,
        name: '3학년 1학기',
        courses: [
          { id: 'c-3-0-1', type: 'JP', name: '해석학 1', credit: 3 },
          { id: 'c-3-0-2', type: 'JP', name: '수치해석개론', credit: 3 },
          { id: 'c-3-0-3', type: 'JS', name: '객체지향프로그래밍', credit: 3 },
          { id: 'c-3-0-4', type: 'JS', name: '수학적 모델링', credit: 3 },
          { id: 'c-3-0-5', type: 'GS', name: '동아시아과학기술사', credit: 3 },
          { id: 'c-3-0-6', type: 'Eng', name: '중급영어토론', credit: 2 },
          { id: 'c-3-0-7', type: 'Jas', name: 'MOOC', credit: 2 },
        ],
      },
      {
        id: 'sem-3-1',
        originalIndex: 1,
        name: '3학년 여름방학',
        courses: [
          { id: 'c-3-1-1', type: 'Eng', name: '실용영문법', credit: 2 },
        ],
      },
      {
        id: 'sem-3-2',
        originalIndex: 2,
        name: '3학년 2학기',
        courses: [
          { id: 'c-3-2-1', type: 'JS', name: '인공지능', credit: 3 },
          { id: 'c-3-2-2', type: 'JS', name: '금융공학개론', credit: 3 },
          { id: 'c-3-2-3', type: 'JS', name: '인공지능수학', credit: 3 },
          { id: 'c-3-2-4', type: 'JS', name: '수학탐구', credit: 3 },
          { id: 'c-3-2-5', type: 'GS', name: '', credit: 3 },
          { id: 'c-3-2-6', type: 'Eng', name: '', credit: 2 },
          { id: 'c-3-2-7', type: 'Jas', name: '연세 OC', credit: 2 },
        ],
      },
      {
        id: 'sem-3-3',
        originalIndex: 3,
        name: '3학년 겨울방학',
        courses: [{ id: 'c-3-3-1', type: 'Jas', name: '인턴쉽', credit: 1 }],
      },
      {
        id: 'sem-3-4',
        originalIndex: 4,
        name: '4학년 1학기',
        courses: [
          { id: 'c-3-4-1', type: 'JS', name: '알고리즘', credit: 3 },
          { id: 'c-3-4-2', type: 'JS', name: '데이터사이언스 방법론', credit: 3 },
          { id: 'c-3-4-3', type: 'Jas', name: '수학탐구', credit: 3 },
          { id: 'c-3-4-4', type: 'GS', name: '', credit: 3 },
          { id: 'c-3-4-5', type: 'Jas', name: '연세 OC', credit: 2 },
          { id: 'c-3-4-6', type: 'Eng', name: '', credit: 2 },
          { id: 'c-3-4-7', type: 'PE', name: '', credit: 1 },
        ],
      },
      {
        id: 'sem-3-5',
        originalIndex: 5,
        name: '4학년 여름방학',
        courses: [{ id: 'c-3-5-1', type: 'Jas', name: '인턴쉽', credit: 2 }],
      },
      {
        id: 'sem-3-6',
        originalIndex: 6,
        name: '4학년 2학기',
        courses: [
          { id: 'c-3-6-1', type: 'Jas', name: 'MOOC', credit: 2 },
        ],
      },
      {
        id: 'sem-3-7',
        originalIndex: 7,
        name: '4학년 겨울방학',
        courses: [],
      },
    ],
    activities: [
      { id: 'act-3-1', type: 'Research', name: 'UGRP', credit: 0, startSem: 0, endSem: 3 },
      { id: 'act-3-2', type: 'Cert', name: 'SQLD', credit: 0, startSem: 1, endSem: 1 },
      { id: 'act-3-3', type: 'Research', name: '산업경영공학과 인턴', credit: 0, startSem: 1, endSem: 1 },
      { id: 'act-3-4', type: 'Intern', name: 'SES', credit: 0, startSem: 3, endSem: 3 },
      { id: 'act-3-5', type: 'Intern', name: 'SES', credit: 0, startSem: 5, endSem: 5 },
      { id: 'act-3-6', type: 'Cert', name: '토익 스피킹', credit: 0, startSem: 4, endSem: 4 },
      { id: 'act-3-7', type: 'Cert', name: '투자자산운용사', credit: 0, startSem: 5, endSem: 5 },
      { id: 'act-3-8', type: 'Cert', name: '빅데이터 분석기사', credit: 0, startSem: 3, endSem: 3 },
    ],
  },

  // 4. 시나리오: 드랍
  {
    id: 'scenario-4',
    scenarioName: '드랍',
    semesters: [
      {
        id: 'sem-4-0',
        originalIndex: 0,
        name: '3학년 1학기',
        courses: [
          { id: 'c-4-0-1', type: 'JP', name: '수치해석개론', credit: 3 },
          { id: 'c-4-0-2', type: 'JS', name: '객체지향프로그래밍', credit: 3 },
          { id: 'c-4-0-3', type: 'JS', name: '수학적 모델링', credit: 3 },
          { id: 'c-4-0-4', type: 'GS', name: '동아시아과학기술사', credit: 3 },
          { id: 'c-4-0-5', type: 'Eng', name: '중급영어토론', credit: 2 },
          { id: 'c-4-0-6', type: 'Jas', name: 'MOOC', credit: 2 },
        ],
      },
      {
        id: 'sem-4-1',
        originalIndex: 1,
        name: '3학년 여름방학',
        courses: [],
      },
      {
        id: 'sem-4-2',
        originalIndex: 2,
        name: '3학년 2학기',
        courses: [
          { id: 'c-4-2-1', type: 'JS', name: '인공지능', credit: 3 },
          { id: 'c-4-2-2', type: 'JS', name: '금융공학개론', credit: 3 },
          { id: 'c-4-2-3', type: 'JS', name: '인공지능수학', credit: 3 },
          { id: 'c-4-2-4', type: 'JS', name: '수학탐구', credit: 3 },
          { id: 'c-4-2-5', type: 'GS', name: '', credit: 3 },
          { id: 'c-4-2-6', type: 'Eng', name: '', credit: 2 },
          { id: 'c-4-2-7', type: 'Jas', name: '연세 OC', credit: 2 },
        ],
      },
      {
        id: 'sem-4-3',
        originalIndex: 3,
        name: '3학년 겨울방학',
        courses: [
          { id: 'c-4-3-1', type: 'Eng', name: '', credit: 2 },
          { id: 'c-4-3-2', type: 'Eng', name: '', credit: 2 },
        ],
      },
      {
        id: 'sem-4-4',
        originalIndex: 4,
        name: '4학년 1학기',
        courses: [
          { id: 'c-4-4-1', type: 'JS', name: '알고리즘', credit: 3 },
          { id: 'c-4-4-2', type: 'JP', name: '해석학 1', credit: 3 },
          { id: 'c-4-4-3', type: 'Jas', name: '데이터마이닝방법론', credit: 3 },
          { id: 'c-4-4-4', type: 'Jas', name: '수학탐구', credit: 3 },
          { id: 'c-4-4-5', type: 'Jas', name: '연세 OC', credit: 2 },
          { id: 'c-4-4-6', type: 'GS', name: '', credit: 3 },
          { id: 'c-4-4-7', type: 'PE', name: '', credit: 1 },
        ],
      },
      {
        id: 'sem-4-5',
        originalIndex: 5,
        name: '4학년 여름방학',
        courses: [],
      },
      {
        id: 'sem-4-6',
        originalIndex: 6,
        name: '4학년 2학기',
        courses: [
          { id: 'c-4-6-1', type: 'Jas', name: 'MOOC', credit: 2 },
        ],
      },
      {
        id: 'sem-4-7',
        originalIndex: 7,
        name: '4학년 겨울방학',
        courses: [],
      },
    ],
    activities: [
      { id: 'act-4-1', type: 'Intern', name: 'SES', credit: 0, startSem: 1, endSem: 1 },
      { id: 'act-4-2', type: 'Intern', name: 'SES', credit: 0, startSem: 5, endSem: 5 },
      { id: 'act-4-3', type: 'Research', name: 'UGRP', credit: 0, startSem: 0, endSem: 3 },
      { id: 'act-4-4', type: 'Cert', name: 'SQLD', credit: 0, startSem: 1, endSem: 1 },
      { id: 'act-4-5', type: 'Cert', name: '토익 스피킹', credit: 0, startSem: 4, endSem: 4 },
      { id: 'act-4-6', type: 'Cert', name: '투자자산운용사', credit: 0, startSem: 5, endSem: 5 },
      { id: 'act-4-7', type: 'Cert', name: '빅데이터 분석기사', credit: 0, startSem: 3, endSem: 3 },
    ],
  },
];

