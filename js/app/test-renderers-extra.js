/**
 * test-renderers-extra.js - 额外测试页面渲染
 * 观己 - 静观己心，内外澄明
 * 
 * 从 app.js 拆分
 * 职责：依恋、情商、价值观、心理健康测试页面渲染
 */

// ============ 依恋类型测试 ============

/**
 * 渲染依恋类型介绍页
 */
App.renderAttachment = async function() {
  const container = document.getElementById('mainContent');
  const latestTest = await Storage.getLatestTest('attachment');

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card mb-xl">
        <div class="card-body" style="padding: var(--spacing-2xl);">
          <div class="text-center mb-xl">
            <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">💞</div>
            <h1 class="font-bold" style="font-size: var(--font-size-3xl);">依恋类型测试</h1>
            <p class="text-secondary mt-md" style="max-width: 600px; margin: 0 auto;">
              依恋理论揭示了我们在亲密关系中的行为模式。了解你的依恋类型，
              有助于建立更健康的人际关系。
            </p>
          </div>

          <div class="grid grid-cols-4 gap-md mb-xl">
            <div class="text-center p-md">
              <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🛡️</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">安全型</div>
            </div>
            <div class="text-center p-md">
              <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">💓</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">焦虑型</div>
            </div>
            <div class="text-center p-md">
              <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🏔️</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">回避型</div>
            </div>
            <div class="text-center p-md">
              <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🌊</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">恐惧型</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-secondary">共 30 道题目，预计用时 5-8 分钟</p>
              ${latestTest ? `
                <p class="text-tertiary mt-sm" style="font-size: var(--font-size-sm);">
                  上次测试：${Utils.formatRelativeTime(latestTest.timestamp)}
                </p>
              ` : ''}
            </div>
            <a href="#/attachment/test" class="btn btn-primary btn-lg">
              ${latestTest ? '重新测试' : '开始测试'}
            </a>
          </div>
        </div>
      </div>

      ${latestTest && latestTest.result ? `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">上次测试结果</h3>
          </div>
          <div class="card-body">
            <div class="flex items-center gap-lg">
              <div style="font-size: 3rem;">${latestTest.result.typeInfo.icon}</div>
              <div class="flex-1">
                <h3 class="font-bold" style="color: ${latestTest.result.typeInfo.color}; font-size: var(--font-size-xl);">
                  ${latestTest.result.typeInfo.name}
                </h3>
                <p class="text-secondary mt-sm">${latestTest.result.typeInfo.description}</p>
              </div>
              <a href="#/report/${latestTest.id}" class="btn btn-outline">查看详细报告</a>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
};

/**
 * 渲染依恋类型测试页
 */
App.renderAttachmentTest = async function() {
  const container = document.getElementById('mainContent');
  
  Attachment.init();

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="card-title">依恋类型测试</h2>
              <p class="card-subtitle" id="attachmentProgress">第 1 题 / 共 ${Attachment.questions.length} 题</p>
            </div>
            <button class="btn btn-outline" onclick="App.confirmQuitTest('/attachment')">退出测试</button>
          </div>
          <div class="progress mt-md">
            <div class="progress-bar" id="attachmentProgressBar" style="width: 0%;"></div>
          </div>
        </div>
        <div class="card-body" id="attachmentQuestionArea"></div>
      </div>
    </div>
  `;

  Attachment.renderQuestion();
};

// ============ 情商测试 ============

/**
 * 渲染情商测试介绍页
 */
App.renderEQ = async function() {
  const container = document.getElementById('mainContent');
  const latestTest = await Storage.getLatestTest('eq');

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card mb-xl">
        <div class="card-body" style="padding: var(--spacing-2xl);">
          <div class="text-center mb-xl">
            <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">🧠</div>
            <h1 class="font-bold" style="font-size: var(--font-size-3xl);">情商测试</h1>
            <p class="text-secondary mt-md" style="max-width: 600px; margin: 0 auto;">
              情商 (EQ) 是理解和管理自己及他人情绪的能力。
              高情商有助于建立更好的人际关系和职业发展。
            </p>
          </div>

          <div class="grid grid-cols-5 gap-md mb-xl">
            <div class="text-center p-md">
              <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🔍</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">自我认知</div>
            </div>
            <div class="text-center p-md">
              <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🎯</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">自我管理</div>
            </div>
            <div class="text-center p-md">
              <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🔥</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">自我激励</div>
            </div>
            <div class="text-center p-md">
              <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">💗</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">共情能力</div>
            </div>
            <div class="text-center p-md">
              <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🤝</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">社交技巧</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-secondary">共 40 道题目，预计用时 8-10 分钟</p>
              ${latestTest ? `
                <p class="text-tertiary mt-sm" style="font-size: var(--font-size-sm);">
                  上次测试：${Utils.formatRelativeTime(latestTest.timestamp)}
                </p>
              ` : ''}
            </div>
            <a href="#/eq/test" class="btn btn-primary btn-lg">
              ${latestTest ? '重新测试' : '开始测试'}
            </a>
          </div>
        </div>
      </div>

      ${latestTest && latestTest.result ? `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">上次测试结果</h3>
          </div>
          <div class="card-body">
            <div class="flex items-center gap-lg">
              <div class="text-center">
                <div style="font-size: 2.5rem; font-weight: 700;">${latestTest.result.overallScore}</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">总分</div>
              </div>
              <div class="flex-1">
                <span class="badge" style="background: ${latestTest.result.level.color}20; color: ${latestTest.result.level.color};">
                  ${latestTest.result.level.name}
                </span>
                <p class="text-secondary mt-sm">${latestTest.result.level.description}</p>
              </div>
              <a href="#/report/${latestTest.id}" class="btn btn-outline">查看详细报告</a>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
};

/**
 * 渲染情商测试页
 */
App.renderEQTest = async function() {
  const container = document.getElementById('mainContent');
  
  EQ.init();

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="card-title">情商测试</h2>
              <p class="card-subtitle" id="eqProgress">第 1 题 / 共 ${EQ.questions.length} 题</p>
            </div>
            <button class="btn btn-outline" onclick="App.confirmQuitTest('/eq')">退出测试</button>
          </div>
          <div class="progress mt-md">
            <div class="progress-bar" id="eqProgressBar" style="width: 0%;"></div>
          </div>
        </div>
        <div class="card-body" id="eqQuestionArea"></div>
      </div>
    </div>
  `;

  EQ.renderQuestion();
};

// ============ 价值观测试 ============

/**
 * 渲染价值观测试介绍页
 */
App.renderValues = async function() {
  const container = document.getElementById('mainContent');
  const latestTest = await Storage.getLatestTest('values');

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card mb-xl">
        <div class="card-body" style="padding: var(--spacing-2xl);">
          <div class="text-center mb-xl">
            <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">💎</div>
            <h1 class="font-bold" style="font-size: var(--font-size-3xl);">价值观测试</h1>
            <p class="text-secondary mt-md" style="max-width: 600px; margin: 0 auto;">
              价值观是我们生活的指南针，影响着我们的选择和行为。
              了解自己的核心价值观，有助于做出更符合内心的决定。
            </p>
          </div>

          <div class="grid grid-cols-5 gap-md mb-xl">
            <div class="text-center p-md">
              <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🏆</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">成就</div>
            </div>
            <div class="text-center p-md">
              <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🦅</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">自主</div>
            </div>
            <div class="text-center p-md">
              <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">💗</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">仁慈</div>
            </div>
            <div class="text-center p-md">
              <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🛡️</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">安全</div>
            </div>
            <div class="text-center p-md">
              <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🌍</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">普世</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-secondary">共 30 道题目，预计用时 5-8 分钟</p>
              ${latestTest ? `
                <p class="text-tertiary mt-sm" style="font-size: var(--font-size-sm);">
                  上次测试：${Utils.formatRelativeTime(latestTest.timestamp)}
                </p>
              ` : ''}
            </div>
            <a href="#/values/test" class="btn btn-primary btn-lg">
              ${latestTest ? '重新测试' : '开始测试'}
            </a>
          </div>
        </div>
      </div>

      ${latestTest && latestTest.result ? `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">上次测试结果 - 核心价值观</h3>
          </div>
          <div class="card-body">
            <div class="flex items-center gap-lg">
              <div class="flex gap-md">
                ${latestTest.result.coreValues.slice(0, 3).map((v, i) => `
                  <div class="text-center">
                    <div style="font-size: 2rem;">${v.info.icon}</div>
                    <div class="text-secondary" style="font-size: var(--font-size-sm);">${v.info.name}</div>
                  </div>
                `).join('')}
              </div>
              <div class="flex-1"></div>
              <a href="#/report/${latestTest.id}" class="btn btn-outline">查看详细报告</a>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
};

/**
 * 渲染价值观测试页
 */
App.renderValuesTest = async function() {
  const container = document.getElementById('mainContent');
  
  Values.init();

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="card-title">价值观测试</h2>
              <p class="card-subtitle" id="valuesProgress">第 1 题 / 共 ${Values.questions.length} 题</p>
            </div>
            <button class="btn btn-outline" onclick="App.confirmQuitTest('/values')">退出测试</button>
          </div>
          <div class="progress mt-md">
            <div class="progress-bar" id="valuesProgressBar" style="width: 0%;"></div>
          </div>
        </div>
        <div class="card-body" id="valuesQuestionArea"></div>
      </div>
    </div>
  `;

  Values.renderQuestion();
};

// ============ 心理健康自测 ============

/**
 * 渲染心理健康自测介绍页
 */
App.renderStress = async function() {
  const container = document.getElementById('mainContent');
  const latestTest = await Storage.getLatestTest('stress');

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card mb-xl">
        <div class="card-body" style="padding: var(--spacing-2xl);">
          <div class="text-center mb-xl">
            <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">🧘</div>
            <h1 class="font-bold" style="font-size: var(--font-size-3xl);">心理健康自测</h1>
            <p class="text-secondary mt-md" style="max-width: 600px; margin: 0 auto;">
              使用国际通用的 GAD-7 和 PHQ-9 量表，帮助你了解自己近期的焦虑和情绪状况。
              本测试仅供自我了解参考，不能替代专业诊断。
            </p>
          </div>

          <div class="grid grid-cols-2 gap-lg mb-xl">
            <div class="p-lg" style="background: var(--bg-secondary); border-radius: var(--radius-lg);">
              <div class="flex items-center gap-md mb-md">
                <span style="font-size: 1.5rem;">😰</span>
                <h3 class="font-semibold">GAD-7 焦虑量表</h3>
              </div>
              <p class="text-secondary" style="font-size: var(--font-size-sm);">
                评估过去两周内的焦虑症状程度，共7道题
              </p>
            </div>
            <div class="p-lg" style="background: var(--bg-secondary); border-radius: var(--radius-lg);">
              <div class="flex items-center gap-md mb-md">
                <span style="font-size: 1.5rem;">😔</span>
                <h3 class="font-semibold">PHQ-9 情绪量表</h3>
              </div>
              <p class="text-secondary" style="font-size: var(--font-size-sm);">
                评估过去两周内的情绪状况，共9道题
              </p>
            </div>
          </div>

          <div class="divider"></div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-secondary">共 16 道题目，预计用时 3-5 分钟</p>
              ${latestTest ? `
                <p class="text-tertiary mt-sm" style="font-size: var(--font-size-sm);">
                  上次测试：${Utils.formatRelativeTime(latestTest.timestamp)}
                </p>
              ` : ''}
            </div>
            <a href="#/stress/test" class="btn btn-primary btn-lg">
              ${latestTest ? '重新测试' : '开始测试'}
            </a>
          </div>
        </div>
      </div>

      ${latestTest && latestTest.result ? `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">上次测试结果</h3>
          </div>
          <div class="card-body">
            <div class="flex items-center gap-xl">
              <div class="text-center">
                <div class="text-secondary mb-sm" style="font-size: var(--font-size-sm);">焦虑</div>
                <span class="badge" style="background: ${latestTest.result.anxietyLevel.color}20; color: ${latestTest.result.anxietyLevel.color};">
                  ${latestTest.result.anxietyLevel.name}
                </span>
              </div>
              <div class="text-center">
                <div class="text-secondary mb-sm" style="font-size: var(--font-size-sm);">情绪</div>
                <span class="badge" style="background: ${latestTest.result.depressionLevel.color}20; color: ${latestTest.result.depressionLevel.color};">
                  ${latestTest.result.depressionLevel.name}
                </span>
              </div>
              <div class="flex-1"></div>
              <a href="#/report/${latestTest.id}" class="btn btn-outline">查看详细报告</a>
            </div>
          </div>
        </div>
      ` : ''}

      <div class="card mt-lg" style="background: var(--bg-secondary);">
        <div class="card-body">
          <p class="text-tertiary" style="font-size: var(--font-size-sm);">
            <strong>温馨提示：</strong>本测试仅供自我了解和参考，不能替代专业的心理健康诊断。
            如果您持续感到困扰，建议咨询专业的心理健康服务人员。
          </p>
        </div>
      </div>
    </div>
  `;
};

/**
 * 渲染心理健康测试页
 */
App.renderStressTest = async function() {
  const container = document.getElementById('mainContent');
  
  Stress.init();

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="card-title">心理健康自测</h2>
              <p class="card-subtitle" id="stressProgress">第 1 题 / 共 ${Stress.questions.length} 题</p>
            </div>
            <div class="flex items-center gap-md">
              <span class="badge" id="stressScaleBadge" style="background: #f59e0b20; color: #f59e0b;">焦虑自评 (GAD-7)</span>
              <button class="btn btn-outline" onclick="App.confirmQuitTest('/stress')">退出测试</button>
            </div>
          </div>
          <div class="progress mt-md">
            <div class="progress-bar" id="stressProgressBar" style="width: 0%;"></div>
          </div>
        </div>
        <div class="card-body" id="stressQuestionArea"></div>
      </div>
    </div>
  `;

  Stress.renderQuestion();
};
