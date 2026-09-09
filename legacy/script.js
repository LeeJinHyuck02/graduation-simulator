// API 기본 URL
const API_BASE_URL = 'http://localhost:3000/api';
 
// 시나리오 목록 (탭 생성을 위해 사용될 { id, scenario_name } 배열)
let scenarios = [];
let currentScenarioIndex = 0;
let currentScenarioId = null; // 현재 선택된 시나리오의 DB ID
let globalData = null; // 현재 시나리오의 모든 데이터 (semesters, courses, activities)
let showVacations = true; //  방학 표시 여부 상태
let showPreviousSemesters = false; // 이전 학기 표시 여부 상태 (기본: 숨김)
let currentView = 'planner'; // 'planner' (과목 플래너) 또는 'activities' (활동 관리)

const courseTypeOptions = [
    { value: "JP", label: "전필" },
    { value: "JS", label: "전선" },
    { value: "Jas", label: "자선" },
    { value: "GS", label: "교선" },
    { value: "Eng", label: "영어" },
    { value: "PE", label: "체육" }
];

const activityTypeOptions = [
    { value: "Cert", label: "자격증" },
    { value: "Intern", label: "인턴" },
    { value: "Research", label: "연구" }
];

const container = document.getElementById('planner-container');

// 초기 데이터 로드 및 렌더링을 위한 비동기 초기화 함수
async function initializePlanner() {
    await fetchScenarios(); // 모든 시나리오 목록을 먼저 가져옴
    if (scenarios.length > 0) {
        currentScenarioId = scenarios[currentScenarioIndex].id; // 첫 번째 시나리오를 기본으로 선택
        await fetchCurrentScenarioData(); // 선택된 시나리오의 상세 데이터를 가져옴
    }
    renderPlanner(); // 모든 데이터 로드 후 플래너 렌더링
}

// 시나리오 목록 (탭)을 백엔드에서 가져오는 함수
async function fetchScenarios() {
    const response = await fetch(`${API_BASE_URL}/scenarios`);
    if (!response.ok) {
        console.error('시나리오 목록 불러오기 실패', response.status);
        scenarios = [];
        return;
    }

    const rows = await response.json();
    scenarios = Array.isArray(rows)
        ? rows.map((item) => ({
            id: item.id,
            scenarioName: item.scenario_name || item.scenarioName || item.name || `시나리오 ${item.id || '?'}`
        }))
        : [];
}

// 현재 선택된 시나리오의 상세 데이터를 백엔드에서 가져오는 함수
async function fetchCurrentScenarioData() {
    if (!currentScenarioId) {
        globalData = { scenarioName: '', semesters: [], activities: [] };
        return;
    }

    const response = await fetch(`${API_BASE_URL}/scenarios/${currentScenarioId}`);
    if (!response.ok) {
        console.error('시나리오 세부 데이터 불러오기 실패', response.status);
        globalData = { scenarioName: '', semesters: [], activities: [] };
        return;
    }

    const raw = await response.json();
    globalData = {
        scenarioName: raw.scenarioName || raw.scenario_name || '',
        semesters: Array.isArray(raw.semesters) ? raw.semesters : [],
        activities: Array.isArray(raw.activities) ? raw.activities : []
    };

    // 각 학기원의 인덱스 매핑 (기존 코드 재사용 위해 originalIndex를 채움)
    globalData.semesters.forEach((sem, idx) => {
        sem.originalIndex = typeof sem.originalIndex === 'number' ? sem.originalIndex : idx;
        sem.id = sem.id ?? idx;
        sem.courses = Array.isArray(sem.courses) ? sem.courses : [];
    });

    globalData.activities = globalData.activities.map((act) => ({
        type: act.type || act.activity_type || 'Intern',
        name: act.name || act.activity_name || '',
        credit: Number(act.credit ?? act.credits ?? 0) || 0,
        startSem: Number(act.startSem ?? act.start_sem ?? 0) || 0,
        endSem: Number(act.endSem ?? act.end_sem ?? 0) || 0,
        id: act.id ?? null
    }));
}

async function addCourseToSemester(originalIndex) {
    if (!globalData || !Array.isArray(globalData.semesters)) return;
    const targetSem = globalData.semesters.find((sem) => sem.originalIndex === originalIndex);
    if (!targetSem) return;

    const defaultCourse = {
        semester_id: targetSem.id || originalIndex,
        course_type: 'JS',
        course_name: '',
        credit: 0
    };

    try {
        const response = await fetch(`${API_BASE_URL}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(defaultCourse)
        });

        if (response.ok) {
            await fetchCurrentScenarioData();
            renderPlanner(); // Re-render after adding
        } else {
            console.error('Failed to add course');
            alert('과목 추가에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error adding course:', error);
        alert('과목 추가 중 오류가 발생했습니다.');
    }
}

async function moveCourseBetweenSemesters(courseId, fromSemIndex, toSemIndex, courseIndexFromDrag, targetCourseIndex = null) {
    if (!globalData || !globalData.semesters) return;

    const sourceSem = globalData.semesters.find(s => s.originalIndex === fromSemIndex);
    const targetSem = globalData.semesters.find(s => s.originalIndex === toSemIndex);

    if (!sourceSem || !targetSem) {
        console.error('Source or target semester not found');
        return;
    }

    // 이동할 과목의 인덱스를 찾습니다.
    // courseId가 있으면 그것을 사용하고, 없으면 드래그 이벤트에서 전달된 인덱스를 사용합니다.
    let courseIndex = -1;
    if (courseId) {
        courseIndex = sourceSem.courses.findIndex(c => c.id === courseId);
    }
    // ID로 찾지 못한 경우 (예: 새로 추가되어 저장되지 않은 과목) dragstart에서 전달된 인덱스를 사용합니다.
    if (courseIndex === -1 && courseIndexFromDrag !== null) {
        courseIndex = courseIndexFromDrag;
    }

    if (courseIndex === -1 || courseIndex >= sourceSem.courses.length) {
        console.warn('Could not find the course to move.', { fromSemIndex, toSemIndex, courseId, courseIndexFromDrag });
        return;
    }

    // 정확히 같은 위치에 드롭하는 것을 방지합니다.
    if (fromSemIndex === toSemIndex && courseIndex === targetCourseIndex) {
        return;
    }

    // 1. 원본 학기에서 과목을 제거합니다.
    const [course] = sourceSem.courses.splice(courseIndex, 1);
    
    // 과목의 semester_id를 새로운 학기의 DB ID로 업데이트합니다.
    course.semester_id = targetSem.id;

    // 2. 대상 학기에 과목을 추가합니다.
    if (targetCourseIndex !== null && targetCourseIndex !== undefined) {
        targetSem.courses.splice(targetCourseIndex, 0, course);
    } else {
        // 특정 위치가 지정되지 않으면 맨 끝에 추가합니다.
        targetSem.courses.push(course);
    }

    // 3. DB와 동기화합니다.
    try {
        if (fromSemIndex === toSemIndex) { // 같은 학기 내에서 순서만 변경된 경우
            await syncSemesterOrder(targetSem);
        } else { // 다른 학기로 이동한 경우
            if (course.id) { // DB에 저장된 과목인 경우에만 업데이트
                await updateCourseInDb(course.id, { semester_id: targetSem.id, course_type: course.type, course_name: course.name, credit: course.credit });
            }
            await syncSemesterOrder(sourceSem); // 원본 학기 순서 동기화
            await syncSemesterOrder(targetSem); // 대상 학기 순서 동기화
        }
    } catch (error) {
        console.error('DB sync failed during course move:', error);
        alert('오류가 발생하여 이동을 저장하지 못했습니다. 페이지를 새로고침합니다.');
        await fetchCurrentScenarioData();
    }

    renderPlanner(); // UI를 다시 렌더링합니다.
}

async function renderPlanner() {
    container.innerHTML = '';
    container.className = 'container ' + (showVacations ? 'show-vacations' : 'hide-vacations');
    container.setAttribute('data-view', currentView);

    const plannerWrapper = document.createElement('div');
    plannerWrapper.className = 'view-section section-planner';

    const tabContainer = document.createElement('div');
    tabContainer.className = 'scenario-tabs';
    tabContainer.style.display = 'flex';
    tabContainer.style.gap = '10px';
    tabContainer.style.marginBottom = '20px';
    tabContainer.style.flexWrap = 'wrap';

    scenarios.forEach((scen, idx) => {
        const btn = document.createElement('button');
        btn.innerText = scen.scenarioName || scen.scenario_name || `시나리오 ${idx + 1}`;
        btn.style.padding = '8px 16px';
        btn.style.cursor = 'pointer';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';

        if (idx === currentScenarioIndex) {
            btn.style.backgroundColor = 'var(--accent-primary, #4a90e2)';
            btn.style.color = '#fff';
            btn.style.fontWeight = 'bold';
        } else {
            btn.style.backgroundColor = 'var(--bg-secondary, #e0e0e0)';
            btn.style.color = 'var(--text-primary, #333)';
        }

        btn.onclick = () => {
            currentScenarioIndex = idx;
            currentScenarioId = scenarios[currentScenarioIndex].id;
            fetchCurrentScenarioData().then(renderPlanner);
        };
        tabContainer.appendChild(btn);
    });

    const rightActions = document.createElement('div');
    rightActions.style.marginLeft = 'auto';
    rightActions.style.display = 'flex';
    rightActions.style.gap = '10px';

    const viewToggleBtn = document.createElement('button');
    viewToggleBtn.className = 'mobile-only';
    viewToggleBtn.innerText = currentView === 'planner' ? '비교과 활동 관리' : '수강 과목 정보';
    viewToggleBtn.style.padding = '8px 16px';
    viewToggleBtn.style.cursor = 'pointer';
    viewToggleBtn.style.border = '1px solid var(--accent-color)';
    viewToggleBtn.style.borderRadius = '4px';
    viewToggleBtn.style.backgroundColor = currentView === 'planner' ? 'transparent' : 'var(--accent-color)';
    viewToggleBtn.style.color = currentView === 'planner' ? 'var(--accent-color)' : '#fff';
    viewToggleBtn.onclick = () => {
        currentView = currentView === 'planner' ? 'activities' : 'planner';
        renderPlanner();
    };
    rightActions.appendChild(viewToggleBtn);

    const toggleVacBtn = document.createElement('button');
    toggleVacBtn.className = 'desktop-and-planner';
    toggleVacBtn.innerText = showVacations ? '방학 숨기기' : '방학 보이기';
    toggleVacBtn.style.padding = '8px 16px';
    toggleVacBtn.style.cursor = 'pointer';
    toggleVacBtn.style.border = '1px solid var(--border-color)';
    toggleVacBtn.style.borderRadius = '4px';
    toggleVacBtn.style.backgroundColor = 'var(--bg-secondary)';
    toggleVacBtn.style.color = 'var(--text-primary)';
    toggleVacBtn.onclick = () => {
        showVacations = !showVacations;
        renderPlanner();
    };
    rightActions.appendChild(toggleVacBtn);

    const togglePreviousSemBtn = document.createElement('button');
    togglePreviousSemBtn.className = 'desktop-and-planner';
    togglePreviousSemBtn.innerText = showPreviousSemesters ? '이전 학기 가리기' : '이전 학기 보기';
    togglePreviousSemBtn.style.padding = '8px 16px';
    togglePreviousSemBtn.style.cursor = 'pointer';
    togglePreviousSemBtn.style.border = '1px solid var(--border-color)';
    togglePreviousSemBtn.style.borderRadius = '4px';
    togglePreviousSemBtn.style.backgroundColor = 'var(--bg-secondary)';
    togglePreviousSemBtn.style.color = 'var(--text-primary)';
    togglePreviousSemBtn.onclick = () => {
        showPreviousSemesters = !showPreviousSemesters;
        renderPlanner();
    };
    rightActions.appendChild(togglePreviousSemBtn);

    const addActBtn = document.createElement('button');
    addActBtn.className = 'desktop-and-activities';
    addActBtn.innerText = '+ 새 활동 추가';
    addActBtn.style.padding = '8px 16px';
    addActBtn.style.cursor = 'pointer';
    addActBtn.style.border = 'none';
    addActBtn.style.borderRadius = '4px';
    addActBtn.style.backgroundColor = '#2a2a2a';
    addActBtn.style.color = '#fff';
    addActBtn.onclick = () => showAddActivityModal();
    rightActions.appendChild(addActBtn);

    tabContainer.appendChild(rightActions);
    container.appendChild(tabContainer);

    if (!globalData) {
        const loadingMessage = document.createElement('p');
        loadingMessage.innerText = '데이터를 불러오는 중입니다...';
        loadingMessage.style.textAlign = 'center';
        loadingMessage.style.marginTop = '50px';
        plannerWrapper.appendChild(loadingMessage);
        container.appendChild(plannerWrapper);
        updateGlobalStats();
        return;
    }

        // 5학년 여름학기 이후 학기 제거를 위한 기준 인덱스 찾기
        const lastAllowedSemesterIndex = globalData.semesters.findIndex(sem => sem.name === '5학년 여름방학');

        const visibleSemesters = globalData.semesters
            .filter(sem => {
                // 방학 숨기기 모드일 때, 이름에 '방학'이 포함되면 건너뜀
                if (!showVacations && sem.name.includes('방학')) return false;
                // 이전 학기 숨기기 모드일 때, 3학년 1학기와 3학년 여름학기를 건너뜀
                if (!showPreviousSemesters && (sem.name === '3학년 1학기' || sem.name === '3학년 여름방학')) return false;
                
                // 5학년 여름학기 이후 학기 필터링
                if (lastAllowedSemesterIndex !== -1 && sem.originalIndex >= lastAllowedSemesterIndex) {
                    return false;
                }

                return true;
            })
            .sort((a, b) => a.originalIndex - b.originalIndex);

        // 하나의 대시보드 그리드로 학기들을 연속 배치
        const dashboardGrid = document.createElement('div');
        dashboardGrid.className = 'semester-dashboard-grid';
        dashboardGrid.style.gridTemplateColumns = `repeat(${Math.max(visibleSemesters.length, 1)}, 1fr)`;
        dashboardGrid.style.gridTemplateRows = 'auto auto';
        dashboardGrid.style.gap = '8px';

        visibleSemesters.forEach((sem, localIndex) => {
            const card = document.createElement('div');
            card.className = 'semester-card';
            card.style.gridColumn = `${localIndex + 1}`;

            const header = document.createElement('div');
            header.className = 'semester-card-header';

            const titleBlock = document.createElement('div');
            titleBlock.className = 'semester-card-title-block';

            const titleSpan = document.createElement('span');
            titleSpan.className = 'semester-card-title';
            titleSpan.innerText = getShortSemesterName(sem.name);
            titleBlock.appendChild(titleSpan);

            const semesterBadge = document.createElement('span');
            semesterBadge.className = 'semester-card-badge';
            semesterBadge.innerText = sem.name.includes('방학') ? '방학' : '학기';
            titleBlock.appendChild(semesterBadge);

            header.appendChild(titleBlock);

            const arrowSpan = document.createElement('span');
            arrowSpan.className = 'accordion-arrow';
            arrowSpan.innerHTML = '&#9660;';
            header.appendChild(arrowSpan);

            header.onclick = () => {
                card.classList.toggle('collapsed');
            };

            card.appendChild(header);

            const cell = document.createElement('div');
            cell.className = 'semester-courses-cell semester-card-body';

            console.log('Binding drop listeners to card', sem.originalIndex);

            cell.addEventListener('dragover', (e) => {
                console.log('Drag over card', { sem: sem.originalIndex });
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                card.classList.add('drag-over');
            });
            cell.addEventListener('dragleave', () => {
                console.log('Drag leave card', { sem: sem.originalIndex });
                card.classList.remove('drag-over');
            });
            cell.addEventListener('drop', async (e) => {
                console.log('Drop event on card', { sem: sem.originalIndex });
                e.preventDefault();
                card.classList.remove('drag-over');
                console.log('Processing drop on card');
                try {
                    let raw = e.dataTransfer.getData('text');
                    if (!raw) {
                        raw = e.dataTransfer.getData('text/plain');
                    }
                    if (!raw) {
                        raw = e.dataTransfer.getData('application/json');
                    }
                    if (!raw) return;

                    const payload = JSON.parse(raw);
                    const fromSem = Number(payload.fromSem);
                    const courseIndex = Number(payload.courseIndex);
                    const courseId = payload.courseId;
                    const toSem = sem.originalIndex;

                    if (isNaN(fromSem) || fromSem === toSem) return;

                    await moveCourseBetweenSemesters(courseId, fromSem, toSem, isNaN(courseIndex) ? null : courseIndex);
                } catch (err) {
                    console.error('drop 처리 중 예외', err);
                }
            });

            const courseList = document.createElement('ul');
            courseList.className = 'course-list';

            ['dragover', 'drop', 'dragenter', 'dragleave'].forEach(evt => {
                courseList.addEventListener(evt, async (e) => {
                    if (evt === 'dragover' || evt === 'dragenter') {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        card.classList.add('drag-over');
                    }

                    if (evt === 'dragleave') {
                        card.classList.remove('drag-over');
                    }

                    if (evt === 'drop') {
                        e.preventDefault();
                        card.classList.remove('drag-over');
                        try {
                            let raw = e.dataTransfer.getData('text');
                            if (!raw) raw = e.dataTransfer.getData('text/plain');
                            if (!raw) raw = e.dataTransfer.getData('application/json');
                            if (!raw) return;

                            const payload = JSON.parse(raw);
                            const fromSem = Number(payload.fromSem);
                            const courseIndex = Number(payload.courseIndex);
                            const courseId = payload.courseId;
                            const toSem = sem.originalIndex;

                            if (isNaN(fromSem) || fromSem === toSem) return;

                            await moveCourseBetweenSemesters(courseId, fromSem, toSem, isNaN(courseIndex) ? null : courseIndex);
                        } catch (err) {
                            console.error('courseList drop 처리 예외', err);
                        }
                    }
                });
            });

            sem.courses.forEach((course, courseIndex) => {
                const li = createCourseItem(sem.originalIndex, courseIndex, course);
                courseList.appendChild(li);
            });
            cell.appendChild(courseList);

            const addCourseBtn = document.createElement('button');
            addCourseBtn.textContent = '+ 과목 추가';
            addCourseBtn.className = 'btn-add-course';
            addCourseBtn.onclick = async () => {
                await addCourseToSemester(sem.originalIndex);
            };
            cell.appendChild(addCourseBtn);

            const stats = document.createElement('div');
            stats.className = 'stats-box';
            stats.style.marginTop = 'auto';
            stats.style.paddingTop = '10px';
            stats.style.textAlign = 'center';
            stats.style.color = 'var(--text-secondary)';
            stats.style.fontSize = '0.9rem';
            const semCredits = sem.courses.reduce((sum, c) => sum + (c.credit || 0), 0);
            stats.innerText = `${semCredits}학점`;
            cell.appendChild(stats);

            card.appendChild(cell);
            dashboardGrid.appendChild(card);
        });

        const visibleOriginalIndices = visibleSemesters.map(s => s.originalIndex);

        const relevantActivities = globalData.activities
            .filter(act => {
                if (visibleOriginalIndices.length === 0) return false;
                const firstVisible = visibleOriginalIndices[0];
                const lastVisible = visibleOriginalIndices[visibleOriginalIndices.length - 1];
                const overlapStart = Math.max(act.startSem, firstVisible);
                const overlapEnd = Math.min(act.endSem, lastVisible);
                if (overlapStart > overlapEnd) return false;
                return visibleOriginalIndices.some(idx => idx >= overlapStart && idx <= overlapEnd);
            })
            .sort((a, b) => a.startSem - b.startSem);

        const tracks = [];

        relevantActivities.forEach(act => {
            const startColIdx = visibleOriginalIndices.findIndex(idx => idx >= act.startSem);
            let endColIdx = -1;
            for (let i = visibleOriginalIndices.length - 1; i >= 0; i--) {
                if (visibleOriginalIndices[i] <= act.endSem) {
                    endColIdx = i;
                    break;
                }
            }

            if (startColIdx === -1 || endColIdx === -1) return;

            const gridStartCol = startColIdx + 1;
            const gridEndCol = endColIdx + 2;
            const logicalStart = startColIdx;
            const logicalEnd = endColIdx;

            let trackIndex = tracks.findIndex(t => t < logicalStart);
            if (trackIndex === -1) trackIndex = tracks.length;
            tracks[trackIndex] = logicalEnd;

            const bar = createActivityBar(act);
            bar.style.gridColumn = `${gridStartCol} / ${gridEndCol}`;
            bar.style.gridRow = `${trackIndex + 2}`;
            bar.classList.add('desktop-activity-bar');
            dashboardGrid.appendChild(bar);
        });

        plannerWrapper.appendChild(dashboardGrid);

        const dashboardStatsPanel = document.createElement('div');
        dashboardStatsPanel.className = 'dashboard-stats-panel';
        dashboardStatsPanel.innerHTML = `
            <div class="stats-row">
                <div class="stat-group">
                    <span class="stat-label">전공필수</span>
                    <div>
                        <span class="stat-main" id="count-JP">0</span>
                        <span class="stat-sub" id="credit-JP">(0학점)</span>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="stat-group">
                    <span class="stat-label">전공선택</span>
                    <div>
                        <span class="stat-main" id="count-JS">0</span>
                        <span class="stat-sub" id="credit-JS">(0학점)</span>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="stat-group">
                    <span class="stat-label">자유선택</span>
                    <div>
                        <span class="stat-main" id="count-Jas">0</span>
                        <span class="stat-sub" id="credit-Jas">(0학점)</span>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="stat-group">
                    <span class="stat-label">교양선택</span>
                    <div>
                        <span class="stat-main" id="count-GS">0</span>
                        <span class="stat-sub" id="credit-GS">(0학점)</span>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="stat-group">
                    <span class="stat-label">영어 / 체육</span>
                    <div>
                        <span class="stat-main" id="count-Eng" style="color: #d35400;">0 / 4</span>
                        <span style="color: #777; margin: 0 2px;">|</span>
                        <span class="stat-main" id="count-PE" style="color: #16a085;">0 / 1</span>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="stat-group total-credits-group">
                    <span class="stat-label">총 이수 학점</span>
                    <span class="stat-main" id="total-credits">0</span>
                </div>

                <div class="divider"></div>

                <div class="stat-group">
                    <span class="stat-label">자격증</span>
                    <div>
                        <span class="stat-main" id="count-Cert">0개</span>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="stat-group">
                    <span class="stat-label">인턴</span>
                    <div>
                        <span class="stat-main" id="count-Intern">0회</span>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="stat-group">
                    <span class="stat-label">연구</span>
                    <div>
                        <span class="stat-main" id="count-Research">0회</span>
                    </div>
                </div>
            </div>
        `;

        plannerWrapper.appendChild(dashboardStatsPanel);

    // === 2. 비교과 활동 관리 뷰 ===
    const activitiesWrapper = document.createElement('div');
    activitiesWrapper.className = 'view-section section-activities';

        const actSection = document.createElement('div');
        actSection.className = 'grade-section';

        const title = document.createElement('h3');
        title.className = 'grade-title';
        title.innerText = '비교과 활동 내역';
        actSection.appendChild(title);

        if (globalData.activities.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.color = 'var(--text-secondary)';
            emptyMsg.style.padding = '60px 0';
            emptyMsg.innerText = '등록된 비교과 활동이 없습니다. 우측 상단의 추가 버튼을 눌러 활동을 기록해보세요.';
            actSection.appendChild(emptyMsg);
        } else {
            // 1. 활동 종류별로 그룹화
            const groupedActivities = {};
            activityTypeOptions.forEach(opt => {
                groupedActivities[opt.value] = { label: opt.label, acts: [] };
            });

            globalData.activities.forEach(act => {
                const t = act.type || 'Intern';
                if (!groupedActivities[t]) groupedActivities[t] = { label: t, acts: [] };
                groupedActivities[t].acts.push(act);
            });

            // 2. 종류별로 렌더링 (시간 순서 정렬 포함)
            Object.keys(groupedActivities).forEach(typeKey => {
                const group = groupedActivities[typeKey];
                if (group.acts.length === 0) return; // 비어있는 분류는 건너뜀

                // 시작 학기(시간 순서) 기준으로 오름차순 정렬
                group.acts.sort((a, b) => a.startSem - b.startSem);

                const typeHeader = document.createElement('h4');
                typeHeader.innerText = group.label;
                typeHeader.style.marginTop = '30px';
                typeHeader.style.marginBottom = '15px';
                typeHeader.style.color = 'var(--text-primary)';
                typeHeader.style.borderBottom = '1px solid var(--border-color)';
                typeHeader.style.paddingBottom = '8px';
                actSection.appendChild(typeHeader);

                const grid = document.createElement('div');
                grid.className = 'activities-grid';
                
                group.acts.forEach(act => {
                    const card = createActivityCard(act);
                    grid.appendChild(card);
                });

                actSection.appendChild(grid);
            });
        }

        activitiesWrapper.appendChild(actSection);

        // 컨테이너에 래퍼들 추가
        container.appendChild(plannerWrapper);
        container.appendChild(activitiesWrapper);

    updateGlobalStats();
    console.log('Container rect after render', container.getBoundingClientRect());
}

// 학기 이름 축약 함수 (가독성 개선)
function getShortSemesterName(name) {
    return name.replace('학년 ', '-')
               .replace('1학기', '1')
               .replace('2학기', '2')
               .replace('여름방학', '여름')
               .replace('겨울방학', '겨울');
}

// 문자열 기반 색상 생성 (파스텔톤)
function stringToColor(str) {
    if (!str) return 'var(--bg-tertiary)';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 35%)`; // 어두운 테마에 맞는 채도/명도
}

// 수강 과목 아이템 생성
function createCourseItem(semIndex, itemIndex, item) { // item은 course 객체 (DB ID 포함)
    console.log('Creating course item', { semIndex, itemIndex, item });
    const li = document.createElement('li');
    li.className = 'course-item';
    const semesterId = item.semester_id || (globalData.semesters.find((s) => s.originalIndex === semIndex) || {}).id;

    const label = document.createElement('span');
    label.className = 'course-item-label';
    label.innerText = item.name?.trim() || '과목명 없음';
    li.appendChild(label);

    li.title = '더블 클릭하여 과목 세부정보 수정';
    li.ondblclick = () => showCourseEditModal(semIndex, itemIndex, item);

    // drag & drop을 위한 설정
    li.draggable = true;
    li.style.cursor = 'move';
    li.dataset.semIndex = semIndex;
    li.dataset.courseIndex = itemIndex;
    li.dataset.courseId = item.id || '';

    li.addEventListener('dragstart', (e) => {
        console.log('Drag started for course', { semIndex, itemIndex, item });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text', JSON.stringify({
            fromSem: semIndex,
            courseIndex: itemIndex,
            courseId: item.id || null
        }));
        console.debug('dragstart', {fromSem: semIndex, courseIndex: itemIndex, courseId: item.id});
        li.style.opacity = '0.5';
    });

    li.addEventListener('dragend', () => {
        console.log('Drag end for course', { semIndex, itemIndex });
        li.style.opacity = '';
    });

    // 드래그 앤 드롭으로 순서 변경 기능 추가
    li.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation(); // 컨테이너의 dragover 무시
        e.dataTransfer.dropEffect = 'move';
        
        const bounding = li.getBoundingClientRect();
        const offset = bounding.y + (bounding.height / 2);
        
        // 마우스 위치가 요소의 중간 이상인지 이하인지 판별하여 인디케이터 표시
        if (e.clientY - offset > 0) {
            li.style.boxShadow = '0 2px 0 var(--accent-color)';
        } else {
            li.style.boxShadow = '0 -2px 0 var(--accent-color)';
        }
    });

    li.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        li.style.boxShadow = '';
    });

    li.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation(); // 컨테이너의 drop 무시
        li.style.boxShadow = '';
        
        try {
            let raw = e.dataTransfer.getData('text');
            if (!raw) raw = e.dataTransfer.getData('text/plain');
            if (!raw) raw = e.dataTransfer.getData('application/json');
            if (!raw) return;

            const payload = JSON.parse(raw);
            const fromSem = Number(payload.fromSem);
            const sourceCourseIndex = Number(payload.courseIndex);
            const courseId = payload.courseId;
            const toSem = semIndex;

            if (isNaN(fromSem)) return;

            const bounding = li.getBoundingClientRect();
            const offset = bounding.y + (bounding.height / 2);
            let targetCourseIndex = itemIndex;
            
            // 요소의 아래쪽 절반에 드롭하면 현재 요소의 다음 위치로 설정
            if (e.clientY - offset > 0) {
                targetCourseIndex += 1;
            }

            // 같은 학기 내에서 위에서 아래로 이동할 때, 
            // 기존 요소가 배열에서 먼저 빠지기 때문에 타겟 인덱스를 1 줄여줌
            if (fromSem === toSem && sourceCourseIndex < targetCourseIndex) {
                targetCourseIndex -= 1;
            }

            // 제자리 드롭 방지
            if (fromSem === toSem && sourceCourseIndex === targetCourseIndex) return;

            await moveCourseBetweenSemesters(courseId, fromSem, toSem, sourceCourseIndex, targetCourseIndex);
        } catch (err) {
            console.error('item drop 처리 중 예외', err);
        }
    });

    return li;
}

function showCourseEditModal(semIndex, itemIndex, item) {
    const existing = document.getElementById('edit-course-modal');
    if (existing) existing.remove();

    const semester = globalData?.semesters?.find((s) => s.originalIndex === semIndex);
    if (!semester) return;

    const semesterId = item.semester_id || semester.id;

    const overlay = document.createElement('div');
    overlay.id = 'edit-course-modal';
    overlay.className = 'modal-overlay';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const title = document.createElement('h3');
    title.className = 'modal-title';
    title.innerText = '과목 세부정보 수정';
    content.appendChild(title);

    const nameGroup = document.createElement('div');
    nameGroup.className = 'modal-group';
    nameGroup.innerHTML = '<label>과목명</label>';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = item.name || '';
    nameInput.placeholder = '과목명';
    nameGroup.appendChild(nameInput);
    content.appendChild(nameGroup);

    const typeGroup = document.createElement('div');
    typeGroup.className = 'modal-group';
    typeGroup.innerHTML = '<label>이수구분</label>';
    const typeSelect = document.createElement('select');
    courseTypeOptions.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.text = opt.label;
        if (opt.value === item.type) option.selected = true;
        typeSelect.appendChild(option);
    });
    typeGroup.appendChild(typeSelect);
    content.appendChild(typeGroup);

    const creditGroup = document.createElement('div');
    creditGroup.className = 'modal-group';
    creditGroup.innerHTML = '<label>학점</label>';
    const creditInput = document.createElement('input');
    creditInput.type = 'number';
    creditInput.min = '0';
    creditInput.max = '20';
    creditInput.value = item.credit ?? 0;
    creditGroup.appendChild(creditInput);
    content.appendChild(creditGroup);

    const actions = document.createElement('div');
    actions.className = 'modal-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-modal btn-delete';
    deleteBtn.innerText = '삭제';
    deleteBtn.onclick = async () => {
        if (!confirm(`'${item.name || '무명'}' 과목을 삭제하시겠습니까?`)) return;

        if (item.id) {
            await deleteCourseFromDb(item.id);
            await fetchCurrentScenarioData();
        } else {
            deleteCourseFromSemester(semIndex, itemIndex);
        }

        overlay.remove();
        renderPlanner();
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-modal btn-cancel';
    cancelBtn.innerText = '취소';
    cancelBtn.onclick = () => overlay.remove();

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-modal btn-save';
    saveBtn.innerText = '저장';
    saveBtn.onclick = async () => {
        const nextName = nameInput.value.trim();
        if (!nextName) {
            alert('과목명을 입력하세요.');
            return;
        }

        const nextType = typeSelect.value;
        const nextCredit = Number(creditInput.value) || 0;

        item.name = nextName;
        item.type = nextType;
        item.credit = nextCredit;

        if (item.id && semesterId) {
            try {
                await updateCourseInDb(item.id, {
                    course_type: nextType,
                    semester_id: semesterId,
                    course_name: nextName,
                    credit: nextCredit
                });
                await fetchCurrentScenarioData();
            } catch (err) {
                alert('과목 업데이트 중 오류가 발생했습니다: ' + err.message);
                return;
            }
        }

        overlay.remove();
        renderPlanner();
    };

    actions.appendChild(deleteBtn);
    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    content.appendChild(actions);

    overlay.appendChild(content);
    document.body.appendChild(overlay);
    nameInput.focus();
}

// 특정 학기의 과목 순서를 DB와 동기화하는 헬퍼 함수
async function syncSemesterOrder(semester) {
    if (!semester || !semester.id || !Array.isArray(semester.courses)) {
        console.warn('Cannot sync order for invalid semester object', semester);
        return;
    }

    const orderedCourseIds = semester.courses
        .map(c => c.id)
        .filter(id => id != null); // DB ID가 있는 과목만 포함

    // ID가 있는 과목이 하나도 없으면 API를 호출할 필요 없음
    if (orderedCourseIds.length === 0 && semester.courses.length > 0) {
         console.debug(`Semester ${semester.id} has only local courses, skipping order sync.`);
         return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/semesters/${semester.id}/courses/order`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderedCourseIds)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to sync course order');
        }
        console.log(`Course order for semester ${semester.id} synced successfully.`);
    } catch (error) {
        console.error(`Error syncing order for semester ${semester.id}:`, error);
        throw error;
    }
}

// 학기 셀 내부에 표시되는 미니 활동 바 UI 생성 (데스크탑 용)
function createActivityBar(act) {
    const div = document.createElement('div');
    div.className = 'activity-bar';
    div.style.backgroundColor = stringToColor(act.name);
    div.title = '더블 클릭하여 활동 세부정보 수정';
    div.ondblclick = () => showActivityEditModal(act);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'activity-bar-name';
    nameSpan.innerText = act.name || '활동명 없음';
    div.appendChild(nameSpan);

    return div;
}

// 활동 관리용 카드 UI 생성
function createActivityCard(act) {
    const card = document.createElement('div');
    card.className = 'activity-card';
    card.title = '더블 클릭하여 활동 세부정보 수정';
    card.ondblclick = () => showActivityEditModal(act);

    // Header (색상 태그 + 삭제 버튼)
    const header = document.createElement('div');
    header.className = 'activity-card-header';
    
    const colorTag = document.createElement('div');
    colorTag.style.width = '12px';
    colorTag.style.height = '12px';
    colorTag.style.borderRadius = '50%';
    colorTag.style.backgroundColor = stringToColor(act.name);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-remove';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = async () => {
        if(confirm(`'${act.name}' 활동을 삭제하시겠습니까?`)) {
            if (act.id) {
                await deleteActivityFromDb(act.id);
                await fetchCurrentScenarioData();
            } else {
                const idx = globalData.activities.indexOf(act);
                if (idx > -1) globalData.activities.splice(idx, 1);
            }
            renderPlanner();
        }
    };

    header.appendChild(colorTag);
    header.appendChild(removeBtn);
    card.appendChild(header);

    const summary = document.createElement('div');
    summary.className = 'activity-card-row';
    summary.style.justifyContent = 'space-between';
    summary.innerHTML = `<label>활동</label><span>${act.name || '활동명 없음'}</span>`;
    card.appendChild(summary);

    const typeSummary = document.createElement('div');
    typeSummary.className = 'activity-card-row';
    typeSummary.style.justifyContent = 'space-between';
    const typeLabel = activityTypeOptions.find((opt) => opt.value === act.type)?.label || act.type || '-';
    typeSummary.innerHTML = `<label>분류</label><span>${typeLabel}</span>`;
    card.appendChild(typeSummary);

    const durationSummary = document.createElement('div');
    durationSummary.className = 'activity-card-row';
    durationSummary.style.justifyContent = 'space-between';
    const startSemObj = globalData.semesters.find((sem) => sem.originalIndex === act.startSem);
    const endSemObj = globalData.semesters.find((sem) => sem.originalIndex === act.endSem);
    const startName = startSemObj ? getShortSemesterName(startSemObj.name) : '';
    const endName = endSemObj ? getShortSemesterName(endSemObj.name) : '';
    durationSummary.innerHTML = `<label>기간</label><span>${startName === endName ? startName : `${startName}~${endName}`}</span>`;
    card.appendChild(durationSummary);

    return card;
}

function showActivityEditModal(act) {
    const existing = document.getElementById('edit-activity-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'edit-activity-modal';
    overlay.className = 'modal-overlay';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const title = document.createElement('h3');
    title.className = 'modal-title';
    title.innerText = '활동 세부정보 수정';
    content.appendChild(title);

    const nameGroup = document.createElement('div');
    nameGroup.className = 'modal-group';
    nameGroup.innerHTML = '<label>활동명</label>';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = act.name || '';
    nameGroup.appendChild(nameInput);
    content.appendChild(nameGroup);

    const typeGroup = document.createElement('div');
    typeGroup.className = 'modal-group';
    typeGroup.innerHTML = '<label>종류</label>';
    const typeSelect = document.createElement('select');
    activityTypeOptions.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.text = opt.label;
        if (opt.value === act.type) option.selected = true;
        typeSelect.appendChild(option);
    });
    typeGroup.appendChild(typeSelect);
    content.appendChild(typeGroup);

    const startGroup = document.createElement('div');
    startGroup.className = 'modal-group';
    startGroup.innerHTML = '<label>시작 학기</label>';
    const startSelect = document.createElement('select');

    const endGroup = document.createElement('div');
    endGroup.className = 'modal-group';
    endGroup.innerHTML = '<label>종료 학기</label>';
    const endSelect = document.createElement('select');

    globalData.semesters.forEach((sem) => {
        const startOpt = document.createElement('option');
        startOpt.value = sem.originalIndex;
        startOpt.text = getShortSemesterName(sem.name);
        if (sem.originalIndex === act.startSem) startOpt.selected = true;
        startSelect.appendChild(startOpt);

        const endOpt = document.createElement('option');
        endOpt.value = sem.originalIndex;
        endOpt.text = getShortSemesterName(sem.name);
        if (sem.originalIndex === act.endSem) endOpt.selected = true;
        endSelect.appendChild(endOpt);
    });

    startSelect.onchange = () => {
        if (Number(startSelect.value) > Number(endSelect.value)) {
            endSelect.value = startSelect.value;
        }
    };
    endSelect.onchange = () => {
        if (Number(endSelect.value) < Number(startSelect.value)) {
            startSelect.value = endSelect.value;
        }
    };

    startGroup.appendChild(startSelect);
    endGroup.appendChild(endSelect);
    content.appendChild(startGroup);
    content.appendChild(endGroup);

    const actions = document.createElement('div');
    actions.className = 'modal-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-modal btn-delete';
    deleteBtn.innerText = '삭제';
    deleteBtn.onclick = async () => {
        if (!confirm(`'${act.name}' 활동을 삭제하시겠습니까?`)) return;

        if (act.id) {
            await deleteActivityFromDb(act.id);
            await fetchCurrentScenarioData();
        } else {
            const idx = globalData.activities.indexOf(act);
            if (idx > -1) globalData.activities.splice(idx, 1);
        }

        overlay.remove();
        renderPlanner();
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-modal btn-cancel';
    cancelBtn.innerText = '취소';
    cancelBtn.onclick = () => overlay.remove();

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-modal btn-save';
    saveBtn.innerText = '저장';
    saveBtn.onclick = async () => {
        const nextName = nameInput.value.trim();
        if (!nextName) {
            alert('활동명을 입력하세요.');
            return;
        }

        const nextType = typeSelect.value;
        const nextStartSem = Number(startSelect.value);
        const nextEndSem = Number(endSelect.value);

        act.name = nextName;
        act.type = nextType;
        act.startSem = nextStartSem;
        act.endSem = nextEndSem;

        if (act.id) {
            await updateActivityInDb(act.id, act);
            await fetchCurrentScenarioData();
        }

        overlay.remove();
        renderPlanner();
    };

    actions.appendChild(deleteBtn);
    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    content.appendChild(actions);

    overlay.appendChild(content);
    document.body.appendChild(overlay);
    nameInput.focus();
}

// 활동 추가 모달 창 표시
function showAddActivityModal() {
    if (document.getElementById('add-activity-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'add-activity-modal';
    overlay.className = 'modal-overlay';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const title = document.createElement('h3');
    title.className = 'modal-title';
    title.innerText = '새 활동 추가';
    content.appendChild(title);

    // 활동명 입력
    const nameGroup = document.createElement('div');
    nameGroup.className = 'modal-group';
    nameGroup.innerHTML = '<label>활동명</label>';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = '예: 인턴, 어학성적 등';
    nameGroup.appendChild(nameInput);
    content.appendChild(nameGroup);

    // 종류 선택
    const typeGroup = document.createElement('div');
    typeGroup.className = 'modal-group';
    typeGroup.innerHTML = '<label>종류</label>';
    const typeSelect = document.createElement('select');
    activityTypeOptions.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.text = opt.label;
        typeSelect.appendChild(o);
    });
    typeGroup.appendChild(typeSelect);
    content.appendChild(typeGroup);

    // 시작 학기 선택
    const startGroup = document.createElement('div');
    startGroup.className = 'modal-group';
    startGroup.innerHTML = '<label>시작 학기</label>';
    const startSelect = document.createElement('select');
    
    // 종료 학기 선택
    const endGroup = document.createElement('div');
    endGroup.className = 'modal-group';
    endGroup.innerHTML = '<label>종료 학기</label>';
    const endSelect = document.createElement('select');

    globalData.semesters.forEach((sem) => {
        const startOpt = document.createElement('option');
        startOpt.value = sem.originalIndex;
        startOpt.text = getShortSemesterName(sem.name);
        startSelect.appendChild(startOpt);

        const endOpt = document.createElement('option');
        endOpt.value = sem.originalIndex;
        endOpt.text = getShortSemesterName(sem.name);
        endSelect.appendChild(endOpt);
    });
    
    startGroup.appendChild(startSelect);
    endGroup.appendChild(endSelect);
    content.appendChild(startGroup);
    content.appendChild(endGroup);

    // 종료학기가 시작학기보다 앞서지 않게 제한
    startSelect.onchange = () => { if (Number(startSelect.value) > Number(endSelect.value)) endSelect.value = startSelect.value; };
    endSelect.onchange = () => { if (Number(endSelect.value) < Number(startSelect.value)) startSelect.value = endSelect.value; };

    // 버튼 영역
    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-modal btn-cancel';
    cancelBtn.innerText = '취소';
    cancelBtn.onclick = () => document.body.removeChild(overlay);

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-modal btn-save';
    saveBtn.innerText = '추가';
    saveBtn.onclick = async () => {
        const actName = nameInput.value.trim();
        if (!actName) return alert('활동명을 입력하세요.');

        const newAct = {
            type: typeSelect.value,
            name: actName,
            credit: 0,
            startSem: Number(startSelect.value),
            endSem: Number(endSelect.value)
        };
        
        await addActivityToDb(newAct);
        await fetchCurrentScenarioData();
        document.body.removeChild(overlay);
        renderPlanner();
    };

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    content.appendChild(actions);

    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    nameInput.focus();
}

// updateGlobalStats 함수는 renderPlanner 내에서 직접 처리하므로 제거

function updateGlobalStats() {
    try {
        if (!globalData || !Array.isArray(globalData.semesters) || !Array.isArray(globalData.activities)) {
            return;
        }

        const requirements = { JP: 2, JS: 8, Jas: 5, GS: 3, Eng: 4, PE: 1 };
        const counts = { JP: 0, JS: 0, Jas: 0, GS: 0, Eng: 0, PE: 0 };
        const credits = { JP: 0, JS: 0, Jas: 0, GS: 0, Eng: 0, PE: 0 };
        
        const activityCounts = { Intern: 0 };
        const activityNames = { Intern: [] };
        const uniqueCerts = new Set();
        const uniqueResearch = new Set();

        let totalCredits = 0;

        // Courses Stats
        globalData.semesters.forEach(sem => {
            sem.courses.forEach(c => {
                if (counts[c.type] !== undefined) {
                    counts[c.type]++;
                    credits[c.type] += c.credit;
                }
                if (c.type !== 'Eng') {
                    totalCredits += c.credit;
                }
            });
        });

        // Activities Stats
        globalData.activities.forEach(a => {
            if (a.type === 'Cert') {
                if (a.name && a.name.trim() !== "") {
                    uniqueCerts.add(a.name.trim());
                }
            } else if (a.type === 'Research') {
                if (a.name && a.name.trim() !== "") {
                    uniqueResearch.add(a.name.trim());
                }
            } else if (activityCounts[a.type] !== undefined) {
                activityCounts[a.type]++;
                if (a.name && a.name.trim() !== "") {
                    activityNames[a.type].push(a.name.trim());
                }
            }
        });

        // DOM Update helper
        const updateField = (type) => {
            const req = requirements[type];
            const countEl = document.getElementById(`count-${type}`);
            const creditEl = document.getElementById(`credit-${type}`);
            
            if (countEl) countEl.innerText = `${counts[type]} / ${req}`;
            if (creditEl) creditEl.innerText = `(${credits[type]}학점)`;
        };

        updateField('JP');
        updateField('JS');
        updateField('Jas');
        updateField('GS');
        updateField('Eng');
        updateField('PE');
        
        document.getElementById('total-credits').innerText = totalCredits;

        const certNames = Array.from(uniqueCerts).join(', ');
        document.getElementById('count-Cert').innerText = `${uniqueCerts.size}개${certNames ? ` (${certNames})` : ''}`;

        const internNames = activityNames['Intern'].join(', ');
        document.getElementById('count-Intern').innerText = `${activityCounts['Intern']}회${internNames ? ` (${internNames})` : ''}`;

        const researchNames = Array.from(uniqueResearch).join(', ');
        document.getElementById('count-Research').innerText = `${uniqueResearch.size}회${researchNames ? ` (${researchNames})` : ''}`;
    } catch (error) {
        console.error('Error in updateGlobalStats:', error);
    }
}

// 데이터 저장 (다운로드) 함수
function saveData() {
    if (!globalData) return;
    const dataStr = JSON.stringify(globalData, null, 4);
    const blob = new Blob([dataStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(globalData.scenarioName || 'scenario').replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// 백엔드 API 호출 함수들
async function updateCourseInDb(courseId, courseData) {
    try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(courseData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to update course: ${errorData.message}`);
        }
        console.log(`Course ${courseId} updated successfully.`);
    } catch (error) {
        console.error('Error updating course:', error);
        throw error;
    }
}

async function deleteCourseFromDb(courseId) {
    try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to delete course: ${errorData.message}`);
        }
        console.log(`Course ${courseId} deleted successfully.`);
    } catch (error) {
        console.error('Error deleting course:', error);
        alert('과목 삭제 중 오류가 발생했습니다: ' + error.message);
    }
}

async function addActivityToDb(activityData) {
    try {
        const response = await fetch(`${API_BASE_URL}/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scenario_id: currentScenarioId,
                activity_type: activityData.type,
                activity_name: activityData.name,
                start_sem: activityData.startSem,
                end_sem: activityData.endSem
            })
        });
        if (!response.ok) throw new Error('Failed to create activity');
    } catch (error) {
        console.error(error);
        alert('활동 추가 중 오류가 발생했습니다.');
    }
}

async function updateActivityInDb(activityId, activityData) {
    try {
        const response = await fetch(`${API_BASE_URL}/activities/${activityId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                activity_type: activityData.type,
                activity_name: activityData.name,
                start_sem: activityData.startSem,
                end_sem: activityData.endSem
            })
        });
        if (!response.ok) throw new Error('Failed to update activity');
    } catch (error) {
        console.error(error);
        alert('활동 수정 중 오류가 발생했습니다.');
    }
}

async function deleteActivityFromDb(activityId) {
    try {
        const response = await fetch(`${API_BASE_URL}/activities/${activityId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete activity');
    } catch (error) {
        console.error(error);
        alert('활동 삭제 중 오류가 발생했습니다.');
    }
}

initializePlanner(); // 초기화 함수 호출로 변경

// --- 드래그 중 화면 자동 스크롤 로직 ---
let dragScrollY = 0;
let isDraggingItem = false;

function handleAutoScroll() {
    if (!isDraggingItem) return;
    if (dragScrollY !== 0) {
        window.scrollBy(0, dragScrollY);
    }
    requestAnimationFrame(handleAutoScroll);
}

document.addEventListener('dragstart', () => {
    isDraggingItem = true;
    requestAnimationFrame(handleAutoScroll);
});

document.addEventListener('dragover', (e) => {
    if (!isDraggingItem) return;

    const edgeThreshold = 100; // 가장자리 감지 영역 (px)
    const scrollSpeed = 15;    // 스크롤 속도

    if (e.clientY < edgeThreshold) {
        dragScrollY = -scrollSpeed;
    } else if (window.innerHeight - e.clientY < edgeThreshold) {
        dragScrollY = scrollSpeed;
    } else {
        dragScrollY = 0;
    }
});

// 디버깅: document에 drop 이벤트 추가 (어디든 드롭하면 로그)
document.addEventListener('drop', (e) => {
    console.log('Document drop event detected', e.target);
    isDraggingItem = false;
    dragScrollY = 0;
});

document.addEventListener('dragend', (e) => {
    console.log('Document dragend event detected', e.target);
    isDraggingItem = false;
    dragScrollY = 0;
});