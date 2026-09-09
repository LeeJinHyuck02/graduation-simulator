// 초기 데이터
const defaultData = [
    // 시나리오 3
    {
        scenarioName: "분배",
        semesters: [
            {
                name: "3학년 1학기",
                courses: [
                    { type: "JP", name: "해석학 1", credit: 3 },
                    { type: "JP", name: "수치해석개론", credit: 3 },
                    { type: "JS", name: "객체지향프로그래밍", credit: 3 },
                    { type: "JS", name: "수학적모델링", credit: 3 },
                    { type: "Eng", name: "중급영어토론", credit: 2 },
                    { type: "Jas", name: "MOOC", credit: 2 },
                ]
            },
            {
                name: "3학년 여름방학",
                courses: [
                    { type: "GS", name: "러시아문화와예술", credit: 3 },
                    { type: "GS", name: "", credit: 3 },
                ]
            },
            {
                name: "3학년 2학기",
                courses: [
                    { type: "JS", name: "인공지능수학", credit: 3 },
                    { type: "JS", name: "금융공학개론", credit: 3 },
                    { type: "JS", name: "수학탐구", credit: 3 },
                    { type: "GS", name: "", credit: 3 },
                    { type: "Jas", name: "연세OC", credit: 2 },
                    { type: "Eng", name: "", credit: 2 },
                ]
            },
            {
                name: "3학년 겨울방학",
                courses: [
                    { type: "Eng", name: "", credit: 2 },
                    { type: "Eng", name: "", credit: 2 },
                ]
            },
            
            {
                name: "4학년 1학기",
                courses: [
                    { type: "JS", name: "알고리즘", credit: 3 },
                    { type: "JS", name: "데이터사이언스방법론", credit: 3 },
                    { type: "JS", name: "수학탐구", credit: 3 },
                    { type: "Jas", name: "연세 OC", credit: 2 },
                    { type: "PE", name: "", credit: 1 }
                    
                ]
            },
            {
                name: "4학년 여름방학",
                courses: [
                ]
            },
            {
                name: "4학년 2학기",
                courses: [
                    { type: "Jas", name: "단기유학", credit: 3 },
                ]
            },
            { name: "4학년 겨울방학", courses: [] },

            {
                name: "5학년 1학기",
                courses: [
                    { type: "Jas", name: "인공지능", credit: 3 },
                    { type: "Jas", name: "MOOC", credit: 2 },
                ]
            },
            {
                name: "5학년 여름방학",
                courses: [
                    
                ]
            },
            {
                name: "5학년 2학기",
                courses: [

                ]
            },
            { name: "5학년 겨울방학", courses: [] },
        ],
        activities: [
            { type: "Research", name: "UGRP", credit: 0, startSem: 0, endSem: 3 },
            { type: "Cert", name: "SQLD", credit: 0, startSem: 1, endSem: 1 },
            { type: "Intern", name: "SES", credit: 0, startSem: 5, endSem: 5 },
            { type: "Intern", name: "SES", credit: 0, startSem: 7, endSem: 7 },
            { type: "Cert", name: "토익 스피킹", credit: 0, startSem: 4, endSem: 4 },
            { type: "Cert", name: "투자자산운용사", credit: 0, startSem: 5, endSem: 5 },
            { type: "Cert", name: "빅데이터 분석기사", credit: 0, startSem: 3, endSem: 3 }
        ]
    },
    // 시나리오 1
    {
    scenarioName: "기본",
    semesters: [
        {
            name: "3학년 1학기",
            courses: [
                { type: "JP", name: "해석학 1", credit: 3 },
                { type: "JP", name: "수치해석개론", credit: 3 },
                { type: "JS", name: "객체지향프로그래밍", credit: 3 },
                { type: "JS", name: "수학적 모델링", credit: 3 },
                { type: "Eng", name: "중급영어토론", credit: 2 },
                { type: "Jas", name: "MOOC", credit: 2 },

            ]
        },
        {
            name: "3학년 여름방학",
            courses: [
                
            ]
        },
        {
            name: "3학년 2학기",
            courses: [
                { type: "JS", name: "인공지능", credit: 3 },
                { type: "JS", name: "금융공학개론", credit: 3 },
                { type: "JS", name: "인공지능수학", credit: 3 },
                { type: "JS", name: "수학탐구", credit: 3 },
                
                { type: "Eng", name: "", credit: 2 },
                { type: "Jas", name: "연세 OC", credit: 2 },

            ]
        },
        {
            name: "3학년 겨울방학",
            courses: [
                { type: "Eng", name: "", credit: 2 },
                { type: "Eng", name: "", credit: 2 },
            ]
        },
        {
            name: "4학년 1학기",
            courses: [
                { type: "JS", name: "알고리즘", credit: 3 },
                { type: "JS", name: "데이터사이언스방법론", credit: 3 },
                { type: "Jas", name: "수리데이터사이언스", credit: 3 },
                { type: "Jas", name: "수학탐구", credit: 3 },
                { type: "Jas", name: "연세 OC", credit: 2 },
                { type: "GS", name: "", credit: 3 },
                { type: "PE", name: "", credit: 1 }
                
            ]
        },
        {
            name: "4학년 여름방학",
            courses: [

            ]
        },
        {
            name: "4학년 2학기",
            courses: [
                { type: "GS", name: "", credit: 3 },
                { type: "Jas", name: "MOOC", credit: 2 },
            ]
        },
        { name: "4학년 겨울방학", courses: [] },
    ],
    activities: [
        // startSem, endSem은 semesters 배열의 인덱스 (0부터 시작)
        { type: "Intern", name: "SES", credit: 0, startSem: 1, endSem: 1 }, // 3-Winter
        { type: "Intern", name: "SES", credit: 0, startSem: 5, endSem: 5 }, // 4-Summer
        { type: "Research", name: "UGRP", credit: 0, startSem: 0, endSem: 3 }, // 3-1 ~ 3-2
        { type: "Cert", name: "SQLD", credit: 0, startSem: 1, endSem: 1 }, // 3-Summer
        { type: "Cert", name: "토익 스피킹", credit: 0, startSem: 4, endSem: 4 },
        { type: "Cert", name: "투자자산운용사", credit: 0, startSem: 5, endSem: 5 },
        { type: "Cert", name: "빅데이터 분석기사", credit: 0, startSem: 3, endSem: 3}
    ]
    },
    // 시나리오 2 (초기값은 시나리오 1과 동일, 필요 시 수정 가능)
    {
        scenarioName: "빠른 졸업",
        semesters: [
            {
                name: "3학년 1학기",
                courses: [
                    { type: "JP", name: "해석학 1", credit: 3 },
                    { type: "JP", name: "수치해석개론", credit: 3 },
                    { type: "JS", name: "객체지향프로그래밍", credit: 3 },
                    { type: "JS", name: "수학적 모델링", credit: 3 },
                    { type: "GS", name: "동아시아과학기술사", credit: 3 },
                    { type: "Eng", name: "중급영어토론", credit: 2 },
                    { type: "Jas", name: "MOOC", credit: 2 },

                ]
            },
            {
                name: "3학년 여름방학",
                courses: [
                    { type: "Eng", name: "실용영문법", credit: 2 },
                ]
            },
            {
                name: "3학년 2학기",
                courses: [
                    { type: "JS", name: "인공지능", credit: 3 },
                    { type: "JS", name: "금융공학개론", credit: 3 },
                    { type: "JS", name: "인공지능수학", credit: 3 },
                    { type: "JS", name: "수학탐구", credit: 3 },
                    { type: "GS", name: "", credit: 3 },
                    { type: "Eng", name: "", credit: 2 },
                    { type: "Jas", name: "연세 OC", credit: 2 },
                ]
            },
            {
                name: "3학년 겨울방학",
                courses: [{ type: "Jas", name: "인턴쉽", credit: 1 }]
            },
            {
                name: "4학년 1학기",
                courses: [
                    { type: "JS", name: "알고리즘", credit: 3 },
                    { type: "JS", name: "데이터사이언스 방법론", credit: 3 },
                    { type: "Jas", name: "수학탐구", credit: 3 },
                    { type: "GS", name: "", credit: 3 },
                    { type: "Jas", name: "연세 OC", credit: 2 },
                    { type: "Eng", name: "", credit: 2 },
                    { type: "PE", name: "", credit: 1 }
                    
                ]
            },
            {
                name: "4학년 여름방학",
                courses: [{ type: "Jas", name: "인턴쉽", credit: 2 }]
            },
            {
                name: "4학년 2학기",
                courses: [
                    { type: "Jas", name: "MOOC", credit: 2 },
                ]
            },
            { name: "4학년 겨울방학", courses: [] },
            
        ],
        activities: [
            { type: "Research", name: "UGRP", credit: 0, startSem: 0, endSem: 3 },
            { type: "Cert", name: "SQLD", credit: 0, startSem: 1, endSem: 1 },
            { type: "Research", name: "산업경영공학과 인턴", credit: 0, startSem: 1, endSem: 1 },
            { type: "Intern", name: "SES", credit: 0, startSem: 3, endSem: 3 },
            { type: "Intern", name: "SES", credit: 0, startSem: 5, endSem: 5 },
            { type: "Cert", name: "토익 스피킹", credit: 0, startSem: 4, endSem: 4 },
            { type: "Cert", name: "투자자산운용사", credit: 0, startSem: 5, endSem: 5 },
            { type: "Cert", name: "빅데이터 분석기사", credit: 0, startSem: 3, endSem: 3 }
        ]
    },
    {
    scenarioName: "드랍",
    semesters: [
        {
            name: "3학년 1학기",
            courses: [
                { type: "JP", name: "수치해석개론", credit: 3 },
                { type: "JS", name: "객체지향프로그래밍", credit: 3 },
                { type: "JS", name: "수학적 모델링", credit: 3 },
                { type: "GS", name: "동아시아과학기술사", credit: 3 },
                { type: "Eng", name: "중급영어토론", credit: 2 },
                { type: "Jas", name: "MOOC", credit: 2 },

            ]
        },
        {
            name: "3학년 여름방학",
            courses: [
                
            ]
        },
        {
            name: "3학년 2학기",
            courses: [
                { type: "JS", name: "인공지능", credit: 3 },
                { type: "JS", name: "금융공학개론", credit: 3 },
                { type: "JS", name: "인공지능수학", credit: 3 },
                { type: "JS", name: "수학탐구", credit: 3 },
                { type: "GS", name: "", credit: 3 },
                { type: "Eng", name: "", credit: 2 },
                { type: "Jas", name: "연세 OC", credit: 2 },

            ]
        },
        {
            name: "3학년 겨울방학",
            courses: [
                { type: "Eng", name: "", credit: 2 },
                { type: "Eng", name: "", credit: 2 },
            ]
        },
        {
            name: "4학년 1학기",
            courses: [
                { type: "JS", name: "알고리즘", credit: 3 },
                { type: "JP", name: "해석학 1", credit: 3 },
                { type: "Jas", name: "데이터마이닝방법론", credit: 3 },
                { type: "Jas", name: "수학탐구", credit: 3 },
                { type: "Jas", name: "연세 OC", credit: 2 },
                { type: "GS", name: "", credit: 3 },
                { type: "PE", name: "", credit: 1 }
                
            ]
        },
        {
            name: "4학년 여름방학",
            courses: [

            ]
        },
        {
            name: "4학년 2학기",
            courses: [
                { type: "Jas", name: "MOOC", credit: 2 },
            ]
        },
        { name: "4학년 겨울방학", courses: [] },
    ],
    activities: [
        // startSem, endSem은 semesters 배열의 인덱스 (0부터 시작)
        { type: "Intern", name: "SES", credit: 0, startSem: 1, endSem: 1 }, // 3-Winter
        { type: "Intern", name: "SES", credit: 0, startSem: 5, endSem: 5 }, // 4-Summer
        { type: "Research", name: "UGRP", credit: 0, startSem: 0, endSem: 3 }, // 3-1 ~ 3-2
        { type: "Cert", name: "SQLD", credit: 0, startSem: 1, endSem: 1 }, // 3-Summer
        { type: "Cert", name: "토익 스피킹", credit: 0, startSem: 4, endSem: 4 },
        { type: "Cert", name: "투자자산운용사", credit: 0, startSem: 5, endSem: 5 },
        { type: "Cert", name: "빅데이터 분석기사", credit: 0, startSem: 3, endSem: 3}
    ]
    },
];