const STORAGE_KEY = "hina-galgame-act1-v1";

const chapters = [
  {
    id: "A01",
    title: "第二次放學後",
    mood: "認真",
    intro: [
      ["narration", "第二次走進風紀委員會辦公室時，陽奈沒有睡著。桌上的文件比上次整齊，杯蓋旁也留出一個乾淨的空位。"],
      ["hina", "老師，今天來得比約定時間早兩分鐘。"],
      ["narration", "桌上的備忘錄寫著巡邏交接、校舍設備確認與今日未完成項目；旁邊還有一欄更小的標題：「十分鐘？」"],
      ["hina", "只是標記今天的時間配置。沒有把休息列入正式工作流程的意思。"],
      ["narration", "陽奈需要確認：你真的接納「十分鐘」與「報告」是兩件事。"]
    ],
    choices: [
      { label: "請她先說今天比較累的地方", hint: "休息", flag: "rest", branch: [
        ["hina", "累的地方？不應該只看今天。我昨天睡得很少，兩天前的巡邏也延長了。"],
        ["narration", "你問她今天哪件事最想先放下。陽奈放下筆，承認最想放下的是不斷確認自己還能不能繼續工作。"],
        ["system", "休息旗標＋1"]
      ]},
      { label: "提議從今天最簡單的工作開始", hint: "分工", flag: "teamwork", branch: [
        ["hina", "簡單的工作，比較適合開始。今天先確認巡邏回報是否完整，以及哪一項需要本人決定。"],
        ["narration", "陽奈逐項讀出時段與負責人，你負責標記缺漏；簽名欄仍留在陽奈手邊。"],
        ["hina", "今天我負責判斷，但不一定要負責全部。"],
        ["system", "分工旗標＋1"]
      ]},
      { label: "不談公務，先問她昨天做了什麼", hint: "日常", flag: "ordinary_day", branch: [
        ["hina", "離開辦公室後？我整理了文件，也確認隔天的巡邏名單。"],
        ["narration", "你沒有立刻指出問題，只問除了文件之外有沒有做過其他事。陽奈整理了桌上的小物，保留了一張便條。"],
        ["hina", "原來不需要把全部事情都算進工作，才能記住今天。"],
        ["system", "日常旗標＋1"]
      ]}
    ],
    common: [
      ["hina", "今天也讓我想一想該用十分鐘做什麼。明天如果沒有急件，我會讓今天留下的空位保留在桌上。"],
      ["narration", "陽奈收起今天的文件，把「十分鐘」放在公文夾最上面；桌燈照亮便條上的日期。"],
      ["hina", "我可能還會忘記，也可能把工作排得太滿，但如果桌角還有這張便條，我想至少可以先停一下。"]
    ]
  },
  {
    id: "A02",
    title: "退回的公務",
    mood: "不耐／沉思",
    intro: [
      ["narration", "風紀委員會辦公室裡，陽奈第三次展開同一份巡邏回報。三項退件原因中，只有一項仍需要本人判斷。"],
      ["hina", "上次已經核對過一次了。我重新整理一份就好，你不用停留太久。"],
      ["narration", "陽奈習慣把責任往自己這邊拉。這份退件不是單純的錯誤，而是她還沒區分規則、判斷與核對。"]
    ],
    choices: [
      { label: "先讓她休息，再一起看退件原因", hint: "休息", flag: "rest", branch: [
        ["narration", "你把退件原因分成已確認規則與仍需陽奈判斷的地方。陽奈終於放下筆。"],
        ["hina", "十分鐘。如果十分鐘後又開始重做，你再提醒我一次。"],
        ["system", "休息旗標＋1"]
      ]},
      { label: "共同找出哪一項可以交付確認", hint: "分工", flag: "teamwork", branch: [
        ["hina", "資料完整性也許不需要我親自輸入，只要有人依規則核對。"],
        ["narration", "陽奈拿起「資料缺漏」標籤，保留最後確認；分工第一次變得清楚而不失去主導權。"],
        ["hina", "分工不是讓我不用負責，而是讓負責的範圍更清楚。"],
        ["system", "分工旗標＋1"]
      ]},
      { label: "回到第一次提交，整理可重複規則", hint: "日常", flag: "ordinary_day", branch: [
        ["hina", "第一次提交時，我以為只要把巡邏紀錄完整寫入就不會再被退回。"],
        ["narration", "陽奈在空白頁寫下「巡邏回報提交規則」，不是正式規章，而是一張今天能沿用的清單。"],
        ["hina", "規則和錯誤是兩件事。整理規則可以讓下一次少重做一次。"],
        ["system", "日常旗標＋1"]
      ]}
    ],
    common: [
      ["hina", "公務會退回，但現在有選擇了。我可以選擇哪裡需要自己判斷，哪裡可以請人協助。"],
      ["narration", "陽奈把退件公務放進公文夾。她沒有承諾明天一定順利，只是開始確認流程而不是只承擔重做。"],
      ["hina", "明天再確認。如果我又說只要一個人重新整理就好，請問我是不是漏掉了可確認的規則。"]
    ]
  },
  {
    id: "A03",
    title: "分工清單",
    mood: "嚴肅",
    intro: [
      ["narration", "陽奈在桌面中央放了一張便箋，頂端寫著「今天不能交出去的事」。她正在區分資訊、判斷與確認。"],
      ["hina", "巡邏區域調整牽涉優先順序，不能交出去；回報格式已有規則，可以交付確認。"],
      ["narration", "清單需要承認哪些決定不能委託，又承認哪些只是沒有明確交接的工作。"]
    ],
    choices: [
      { label: "把休息放進清單", hint: "休息", flag: "rest", branch: [
        ["hina", "我不能把休息當成完成清單後才會出現的結果；那樣它永遠排在最後。"],
        ["narration", "陽奈在清單上預留「十分鐘」，讓休息成為工作的時間範圍，而不是獎勵。"],
        ["system", "休息旗標＋1"]
      ]},
      { label: "保留決策與交付界線", hint: "分工", flag: "teamwork", branch: [
        ["hina", "決策由我負責，整理資料與核對範本可以交付確認。"],
        ["narration", "陽奈畫出箭頭：判斷一條線、確認幾條線。她沒有放棄責任，也沒有拿回全部工作。"],
        ["hina", "分工不會讓我失去責任，只是讓責任不再只是一個親自完成的標籤。"],
        ["system", "分工旗標＋1"]
      ]},
      { label: "把清單留成今天暫時使用的工具", hint: "日常", flag: "ordinary_day", branch: [
        ["hina", "這張清單不用變成正式規章，只用於今天放學後。"],
        ["narration", "陽奈在背面記下公文夾位置、回報範本與十分鐘；普通選擇也能成為規則的一部分。"],
        ["hina", "工作之外的判斷也算規則，只是不需要對整個委員會發佈。"],
        ["system", "日常旗標＋1"]
      ]}
    ],
    common: [
      ["hina", "清單完成了：只能由我判斷的事項，以及可以先交由合適的人確認的事項。"],
      ["narration", "陽奈把便條放進公文夾，不會讓清單取代桌角的十分鐘。"],
      ["hina", "明天如果我又把所有項目都寫成只能由我判斷，請問我是不是漏掉了可確認的規則。"]
    ]
  },
  {
    id: "A04",
    title: "走廊上的協助",
    mood: "關心",
    intro: [
      ["narration", "走廊轉角，一名學生抱著過重的文件夾停在原地。陽奈先確認目的地、資料與可用時間。"],
      ["hina", "不是問你為什麼沒有準備工具，我先確認目的地與時間。"],
      ["narration", "學生需要送資料到會議室，又要鎖好教室。陽奈的分工清單可以辨認下一步，但不能替學生決定一切。"]
    ],
    choices: [
      { label: "請陽奈把公務交給你保管", hint: "休息", flag: "rest", branch: [
        ["hina", "巡邏區域要等我判斷，通知已經交付確認；只要你替我保管清單，我就知道沒有遺忘。"],
        ["narration", "陽奈確認她交出去的是手上的公務，不是責任本身，然後開始協助學生。"],
        ["system", "休息旗標＋1"]
      ]},
      { label: "讓學生列出兩件最先要做的事", hint: "分工", flag: "teamwork", branch: [
        ["hina", "沒有人需要一次記住全部，我們先確認哪一步能獨立完成。"],
        ["narration", "學生說出資料與教室兩件事。陽奈找到可確認的下一步，不把全部處理一起接過來。"],
        ["hina", "不需要由我親自完成每一步，也要確保每一步都有交付者。"],
        ["system", "分工旗標＋1"]
      ]},
      { label: "一起走到資料目的地再決定分工", hint: "日常", flag: "ordinary_day", branch: [
        ["narration", "三人沿走廊確認資料夾重心與移動路線；陽奈將臨時協助單獨記在完成欄。"],
        ["hina", "今天多了一件不在清單上的事，但清單不需要只記公務。"],
        ["system", "日常旗標＋1"]
      ]}
    ],
    common: [
      ["hina", "風紀委員會的責任不只有停止混亂，也包括確認混亂發生時有人可以被帶到下一步。"],
      ["narration", "陽奈把目的地、交付者與下一步記下來，沒有把協助當成無限增加的負擔。"],
      ["hina", "明天遇到需要協助的人，我希望不是先問能節省多少公務時間，而是先確認那個人站在哪裡。"]
    ]
  },
  {
    id: "A05",
    title: "錯過休息的時刻",
    mood: "疲倦",
    intro: [
      ["narration", "傍晚的桌燈取代夕光。十分鐘便條仍留在公文夾上方，但時鐘已經越過原定時間。"],
      ["hina", "原本可以在傍晚前停下來。也許今天沒有完全依照約定。"],
      ["narration", "陽奈沒有把錯過說成很嚴重，但也不再假裝沒有看見。她第一次承認需要預留休息。"]
    ],
    choices: [
      { label: "現在就開始休息十分鐘", hint: "休息", flag: "rest", branch: [
        ["narration", "你把時鐘轉到陽奈看得見的位置。十分鐘成為今天剩餘的一段時間，不是昨天的補償。"],
        ["hina", "十分鐘不需要補償昨天，只需要確認今天不會再忘記。"],
        ["system", "休息旗標＋1"]
      ]},
      { label: "先確認今天哪些項目已可交付", hint: "分工", flag: "teamwork", branch: [
        ["hina", "巡邏區域已確認，臨時通知只差最後回覆。等待不是我親自處理，只是確認下一個人何時接到資料。"],
        ["narration", "陽奈給日誌設下期限、交付臨時通知，終於從桌前站起來。"],
        ["system", "分工旗標＋1"]
      ]},
      { label: "不安排行程，只陪她看窗外", hint: "日常", flag: "ordinary_day", branch: [
        ["hina", "原來放學後不是每一秒都需要填補。十分鐘也可以只是十分鐘。"],
        ["narration", "校舍門外只剩兩盞路燈。陽奈第一次把安靜當成安靜，而不是工作空缺。"],
        ["system", "日常旗標＋1"]
      ]}
    ],
    common: [
      ["hina", "我不想把這句話說得太嚴重，但不能再假裝沒有發現休息一直排在最後。"],
      ["narration", "陽奈將便條放在桌角，寫下「先確認是否需要休息，再確認是否需要工作」。"],
      ["hina", "明天的十分鐘也許會忘記，但至少要讓它在開始工作前就有機會被記住。"]
    ]
  },
  {
    id: "A06",
    title: "明天留一段時間",
    mood: "微笑",
    intro: [
      ["narration", "傍晚收束時，桌上有十分鐘便條、分工清單與明天的巡邏區域。陽奈比較它們各自占用的位置。"],
      ["hina", "我原本會把明天的空位留到最後。現在至少可以先確認明天最需要保留的是哪一段。"],
      ["narration", "陽奈在清單旁畫下一個不屬於公務的方框：「放學後，不安排工作十分鐘」。"]
    ],
    choices: [
      { label: "明天先休息，再確認是否談公務", hint: "休息", flag: "rest", extras: ["daily_checkin"], branch: [
        ["hina", "明天我會先讓十分鐘開始，而不是等工作自然結束。"],
        ["narration", "陽奈把「先問剩餘的力氣」寫在便條上，不保證休息能讓工作變快，只確認從可承受的狀況開始。"],
        ["system", "休息旗標＋1｜每日確認＋1"]
      ]},
      { label: "明天先看分工清單，再決定剩多少", hint: "分工", flag: "teamwork", extras: ["daily_checkin"], branch: [
        ["hina", "明天先看清單，也許比先看剩餘公務更清楚。決策與確認不必混在一起。"],
        ["narration", "陽奈把十分鐘放在分工清單的時間範圍之外，確認工作不占滿一天。"],
        ["system", "分工旗標＋1｜每日確認＋1"]
      ]},
      { label: "明天先做一件不以工作為目的的普通事", hint: "日常", flag: "ordinary_day", extras: ["daily_checkin"], branch: [
        ["hina", "普通的事情也需要被記下來，不然會一直被當成沒有完成的額外安排。"],
        ["narration", "陽奈沒有承諾離開校舍，只承諾保留一段沒有公務目的的時間。"],
        ["system", "日常旗標＋1｜每日確認＋1"]
      ]}
    ],
    common: [
      ["hina", "十分鐘不需要每天完全相同，只要明天的對話不是立刻從剩餘工作開始。"],
      ["narration", "陽奈將公文夾收起，分工清單放進明天要查看的夾層。"],
      ["hina", "我不會承諾明天一定完全放下工作，但會先確認明天是否還有一段可以留給自己。"]
    ]
  }
];

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Number.isInteger(saved.chapter)) return saved;
  } catch (_) {}
  return { chapter: 0, phase: "intro", choices: {}, flags: { rest: 0, teamwork: 0, ordinary_day: 0, daily_checkin: 0 } };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  document.getElementById("saveState").textContent = "已自動保存";
}

function elLine([kind, text]) {
  const p = document.createElement("p");
  p.className = kind;
  if (kind === "hina") p.innerHTML = `<strong>陽奈｜${text.includes("明天") ? "微笑" : "認真"}：</strong>${text}`;
  else p.textContent = text;
  return p;
}

function render() {
  const chapter = chapters[state.chapter];
  document.getElementById("chapterLabel").textContent = `${chapter.id}｜${chapter.title}`;
  document.getElementById("mood").textContent = chapter.mood;
  document.getElementById("progress").style.width = `${((state.chapter + 1) / chapters.length) * 100}%`;

  const flagBox = document.getElementById("flags");
  flagBox.innerHTML = "";
  Object.entries(state.flags).forEach(([name, value]) => {
    if (value > 0) {
      const span = document.createElement("span");
      span.className = "flag";
      span.textContent = `${name.replace("ordinary_day", "ordinary")} ${value}`;
      flagBox.appendChild(span);
    }
  });

  const story = document.getElementById("story");
  story.innerHTML = "";

  if (state.phase === "intro") {
    chapter.intro.forEach(line => story.appendChild(elLine(line)));
  } else if (state.phase === "branch") {
    const selected = state.choices[chapter.id];
    selected.branch.forEach(line => story.appendChild(elLine(line)));
  } else if (state.phase === "common") {
    chapter.common.forEach(line => story.appendChild(elLine(line)));
  } else {
    story.innerHTML =
      `<p class="hina"><strong>第一幕完成</strong></p>` +
      `<p class="narration">陽奈保留了一段仍可反覆確認的日常空間。三種陪伴方式都沒有改變校園篇的主線，只留下不同的記憶與旗標。</p>` +
      `<p class="system">rest ${state.flags.rest}｜teamwork ${state.flags.teamwork}｜ordinary_day ${state.flags.ordinary_day}｜daily_checkin ${state.flags.daily_checkin}</p>`;
  }
  story.scrollTop = 0;
  renderControls();
  saveState();
}

function renderControls() {
  const box = document.getElementById("choices");
  box.innerHTML = "";
  const chapter = chapters[state.chapter];

  if (state.phase === "intro") {
    chapter.choices.forEach(choice => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.innerHTML = `${choice.label}<small>影響：${choice.hint}</small>`;
      button.addEventListener("click", () => {
        state.flags[choice.flag] = (state.flags[choice.flag] || 0) + 1;
        (choice.extras || []).forEach(flag => {
          state.flags[flag] = (state.flags[flag] || 0) + 1;
        });
        state.choices[chapter.id] = choice;
        state.phase = "branch";
        render();
      });
      box.appendChild(button);
    });
  } else if (state.phase === "branch") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "next";
    button.textContent = "進入共通會合";
    button.addEventListener("click", () => {
      state.phase = "common";
      render();
    });
    box.appendChild(button);
  } else if (state.phase === "common") {
    const last = state.chapter === chapters.length - 1;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "next";
    button.textContent = last ? "完成第一幕" : `前往 ${chapters[state.chapter + 1].id}`;
    button.addEventListener("click", () => {
      if (last) state.phase = "complete";
      else {
        state.chapter += 1;
        state.phase = "intro";
      }
      render();
    });
    box.appendChild(button);
  } else {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "next";
    button.textContent = "重新開始第一幕";
    button.addEventListener("click", restart);
    box.appendChild(button);
  }
}

function restart() {
  state = { chapter: 0, phase: "intro", choices: {}, flags: { rest: 0, teamwork: 0, ordinary_day: 0, daily_checkin: 0 } };
  render();
}

document.getElementById("restart").addEventListener("click", restart);
render();
