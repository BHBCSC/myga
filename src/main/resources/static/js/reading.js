        document.addEventListener("DOMContentLoaded", function () {
               loadQueryCache(); // ✅ 页面加载时，恢复查询缓存
               setupTitleDropdown(); // ✅ 初始化 title 下拉框
               updateListUI(); // ✅ 确保 Word List 和 Phrase List 加载
               highlightAllWordsAndPhrases();
        });
        // ✅ 监听查询字段变更，存入缓存
        document.getElementById("title").addEventListener("change", function () {
            localStorage.setItem("selectedTitle", this.value);
        });

        document.getElementById("smallTitle").addEventListener("change", function () {
            localStorage.setItem("selectedSmallTitle", this.value);
        });

        // ✅ 处理 Word List 和 Phrase List

        let selectedText = "";
        let wordList = JSON.parse(localStorage.getItem("wordList")) || [];
        let phraseList = JSON.parse(localStorage.getItem("phraseList")) || [];
        let selectionTimeout;
        let currentSelection = null;

        document.addEventListener('selectionchange', function () {
            clearTimeout(selectionTimeout);
            selectionTimeout = setTimeout(handleSelection, 200);
        });


        function handleSelection() {
            const selection = window.getSelection();
            selectedText = selection.toString().trim();

            const translateBtn = document.getElementById('dynamicTranslateBtn');
            translateBtn.style.display = 'none';

            if (selectedText) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                if (rect.width > 0 && rect.height > 0) {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    translateBtn.style.top = (rect.bottom + scrollTop) + 'px';
                    translateBtn.style.left = (rect.left + rect.width / 2) + 'px';
                    translateBtn.style.display = 'block';
                    currentSelection = range;
                }
            }
        }

        document.addEventListener('touchstart', function (e) {
            const translateBtn = document.getElementById('dynamicTranslateBtn');
            if (!e.target.closest('#dynamicTranslateBtn')) {
                translateBtn.style.display = 'none';
            }
        });

        function translateText() {
            if (!selectedText) return;

            if (currentSelection) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(currentSelection);
            }

            let appid = "20250215002274687";
            let key = "d8hVcUSK38q7SbKk_B1s";
            let salt = new Date().getTime();
            let sign = CryptoJS.MD5(appid + selectedText + salt + key).toString();

            let script = document.createElement("script");
            script.src = `https://fanyi-api.baidu.com/api/trans/vip/translate?` +
                `q=${encodeURIComponent(selectedText)}&from=en&to=zh&appid=${appid}` +
                `&salt=${salt}&sign=${sign}&callback=translateCallback`;
            document.body.appendChild(script);
        }

        function translateCallback(response) {
            const popupContent = document.getElementById("translationPopupContent");
            const popup = document.getElementById("translationPopup");

            if (response.trans_result) {
                let translation = response.trans_result[0].dst;
                popupContent.innerText = translation;
            } else {
                popupContent.innerText = "翻译失败，请稍后重试。";
            }

            popup.style.display = "flex"; // 使用 flex 布局
        }

        // 点击弹窗外部关闭弹窗
        document.addEventListener('click', function (e) {
            const popup = document.getElementById("translationPopup");
            if (popup.style.display === "flex" && !e.target.closest("#translationPopup")) {
                closePopup();
            }
        });

        function closePopup() {
            const popup = document.getElementById("translationPopup");
            popup.style.display = "none";

            if (currentSelection) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(currentSelection);
            }
        }



       function updateListUI() {
           let wordListEl = document.getElementById("wordList");
           let phraseListEl = document.getElementById("phraseList");
           wordListEl.innerHTML = "";
           phraseListEl.innerHTML = "";

           wordList.forEach(word => {
               let safeWord = word.replace(/'/g, "\\'"); // ✅ 转义单引号
               let li = document.createElement("li");
               li.innerHTML = `${word} <button onclick="removeFromList('word', '${safeWord}')">删除</button>`;
               wordListEl.appendChild(li);
           });

           phraseList.forEach(phrase => {
               let safePhrase = phrase.replace(/'/g, "\\'"); // ✅ 转义单引号
               let li = document.createElement("li");
               li.innerHTML = `${phrase} <button onclick="removeFromList('phrase', '${safePhrase}')">删除</button>`;
               phraseListEl.appendChild(li);
           });
       }


        function changeFontSize() {
            let fontSize = document.getElementById("fontSizeSelector").value;
            document.getElementById("article").style.fontSize = fontSize;
        }

        function clearCache() {
            localStorage.removeItem("wordList");
            localStorage.removeItem("phraseList");
            wordList = [];
            phraseList = [];
            updateListUI();
            const article = document.getElementById("article");
            article.innerHTML = article.textContent;
            console.log('缓存已清除');
        }
function copyToExcel(type) {
    let list = type === "word" ? wordList : phraseList;
    let textToCopy = list.join('\n');

    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('已复制到剪贴板，可以粘贴到 Excel 中。');
}

function highlightAllWordsAndPhrases() {
    let articleElement = document.getElementById("article");

    // ✅ 先检查缓存的文章内容
    let cachedArticle = localStorage.getItem("selectedArticle");
    if (cachedArticle) {
        articleElement.textContent = cachedArticle; // ✅ 只恢复缓存的文章
    }

    // ✅ 依次高亮 Word List 和 Phrase List
    wordList.forEach(word => highlightText(word, "word"));
    phraseList.forEach(phrase => highlightText(phrase, "phrase"));
}


function highlightText(text, type) {
    let articleElement = document.getElementById("article");
    let className = type === "word" ? "highlight-word" : "highlight-phrase";
    let articleHtml = articleElement.innerHTML;

    // **防止高亮嵌套：不在已有 <span> 标签内再次嵌套**
    let regex = new RegExp(`(?!<[^>]*>)(${escapeRegex(text)})(?![^<]*>)`, "gi");

    articleElement.innerHTML = articleHtml.replace(regex, `<span class="${className}">$1</span>`);
}

// **防止正则匹配错误，转义特殊字符**
function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ✅ 页面加载时，高亮所有已存储的单词和短语
window.onload = function () {
    updateListUI();
    highlightAllWordsAndPhrases();
    changeFontSize();
};

function addToList(type) {
    if (!selectedText) {
        alert("请先选中文本！");
        return;
    }

    let list = type === "word" ? wordList : phraseList;
    if (!list.includes(selectedText)) {
        list.unshift(selectedText);
        localStorage.setItem(type === "word" ? "wordList" : "phraseList", JSON.stringify(list));
        updateListUI();

        // ✅ 直接高亮当前文章，而不是恢复默认文章
        highlightAllWordsAndPhrases();

        closePopup();
    } else {
        alert(`该文本已存在于${type === "word" ? "Word" : "Phrase"}列表中！`);
    }
}


function removeFromList(type, text) {
    let list = type === "word" ? wordList : phraseList;
    let index = list.indexOf(text);
    if (index > -1) {
        list.splice(index, 1);
        localStorage.setItem(type === "word" ? "wordList" : "phraseList", JSON.stringify(list));
        updateListUI();
        highlightAllWordsAndPhrases(); // ✅ 删除后重新高亮剩余的单词和短语
    }
}

function setupTitleDropdown(callback) {
    let titleDropdown = document.getElementById("title");
    titleDropdown.innerHTML = `<option value="全部">全部</option>`; // ✅ 先重置下拉框

    for (let i = 7; i <= 20; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        titleDropdown.appendChild(option);
    }

    titleDropdown.addEventListener("change", function () {
        localStorage.setItem("selectedTitle", this.value);
        clearCacheOnTitleChange(); // ✅ 清空缓存
        fetchReadingList(); // ✅ 重新请求后端数据
    });
 // 添加一个小的延迟，确保选项已经完全添加到下拉框中
    setTimeout(() => {
        if (callback) callback();
    }, 1000);
}


function fetchReadingList() {
    let selectedTitle = document.getElementById("title").value;
    if (selectedTitle === "全部") {
        return;
    }

    console.log("📡 请求后端数据: /reading/getList?title=" + selectedTitle);

    fetch(`/reading?title=${selectedTitle}`)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) {
                console.error("后端返回数据格式错误:", data);
                return;
            }
            localStorage.setItem("readingList", JSON.stringify(data)); // ✅ 缓存返回结果
            localStorage.setItem("selectedTitle", selectedTitle); // ✅ 缓存新的 Title
            updateSmallTitleDropdown(data);
        })
        .catch(error => console.error("获取阅读列表失败:", error));
}



function updateSmallTitleDropdown(readings) {
    if (!Array.isArray(readings)) {
        console.error("updateSmallTitleDropdown() 传入的 readings 不是数组:", readings);
        return;
    }

    let smallTitleDropdown = document.getElementById("smallTitle");
    smallTitleDropdown.innerHTML = `<option value="全部">全部</option>`;

    readings.forEach(reading => {
        let option = document.createElement("option");
        option.value = reading.smallTitle;
        option.textContent = `${reading.smallTitle} - ${reading.article.substring(0, 10)}`;
        smallTitleDropdown.appendChild(option);
    });

    // ✅ 重新加载缓存的 `smallTitle`
    let cachedSmallTitle = localStorage.getItem("selectedSmallTitle");
    if (cachedSmallTitle) {
        smallTitleDropdown.value = cachedSmallTitle;
        updateArticleDisplay(); // ✅ 直接加载缓存的文章
    }

    smallTitleDropdown.addEventListener("change", updateArticleDisplay);
}


function updateArticleDisplay() {
    let selectedSmallTitle = document.getElementById("smallTitle").value;
    let readings = JSON.parse(localStorage.getItem("readingList")) || [];

    let selectedReading = readings.find(reading => reading.smallTitle === selectedSmallTitle);
    if (selectedReading) {
        document.getElementById("article").textContent = selectedReading.article;
        localStorage.setItem("selectedSmallTitle", selectedSmallTitle); // ✅ 缓存 `Small Title`
        localStorage.setItem("selectedArticle", selectedReading.article); // ✅ 缓存文章
        highlightAllWordsAndPhrases(); // ✅ 文章更新时立即应用高亮
    }
}



function loadQueryCache() {
    let cachedTitle = localStorage.getItem("selectedTitle");
    let cachedSmallTitle = localStorage.getItem("selectedSmallTitle");
    let cachedReadingList = localStorage.getItem("readingList");

    setupTitleDropdown(() => {
        if (cachedTitle) {
            let titleDropdown = document.getElementById("title");
            cachedTitle = String(cachedTitle);

            // ✅ 先检查下拉框是否包含该值
            if ([...titleDropdown.options].some(option => option.value === cachedTitle)) {
                titleDropdown.value = cachedTitle;

                // ✅ 如果 `readingList` 已缓存，直接用缓存数据
                if (cachedReadingList) {
                    updateSmallTitleDropdown(JSON.parse(cachedReadingList));
                } else {
                    fetchReadingList(); // ✅ 没有缓存时请求接口
                }
            }
        }

        if (cachedSmallTitle) {
            document.getElementById("smallTitle").value = cachedSmallTitle;
            updateArticleDisplay(); // ✅ 重新展示缓存的文章
        }
    });
}



// ✅ 监听查询字段变更，存入缓存
document.getElementById("title").addEventListener("change", function () {
    localStorage.setItem("selectedTitle", this.value);
});

document.getElementById("smallTitle").addEventListener("change", function () {
    localStorage.setItem("selectedSmallTitle", this.value);
});
function clearCacheOnTitleChange() {
    console.log("🚀 Title 变更，清空缓存并重新加载数据...");
    localStorage.removeItem("readingList"); // ✅ 清空 Reading 列表缓存
    localStorage.removeItem("selectedSmallTitle"); // ✅ 清空 Small Title 选择缓存
    localStorage.removeItem("selectedArticle"); // ✅ 清空文章缓存

    let smallTitleDropdown = document.getElementById("smallTitle");
    smallTitleDropdown.innerHTML = `<option value="全部">全部</option>`; // ✅ 重置 Small Title 选择框
    document.getElementById("article").textContent = "请选择 Title 和 Small Title 查看文章内容"; // ✅ 清空文章
}

function saveReviewResult(type) {
    let list = type === "word" ? wordList : phraseList;
    let title = document.getElementById("title").value;
    let smallTitle = document.getElementById("smallTitle").value;
    let fullTitle = `${title} - ${smallTitle}`;
    let reviewTime = new Date().toISOString().split("T")[0]; // ✅ 获取当天日期

    if (list.length === 0) {
        alert(`列表为空，无法保存 ${type === "word" ? "Word List" : "Phrase List"}！`);
        return;
    }

    let requests = list.map(word => {
        let data = {
            title: fullTitle,
            business: "阅读",
            type: type === "word" ? "单词" : "短语",
            word: word,
            result: "没记住",
            review_time: reviewTime
        };

        return fetch('/wordReviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(response => response.json())
        .catch(error => console.error(`提交 ${word} 失败:`, error));
    });

    // ✅ 并行执行所有请求
    Promise.all(requests)
        .then(() => alert(`✅ ${type === "word" ? "Word List" : "Phrase List"} 已保存！`))
        .catch(error => console.error("保存 review 结果失败:", error));
}
// 新增函数，处理点击【查询接口数据并覆盖】按钮后的逻辑
function queryAndOverride() {
    let title = document.getElementById("title").value;
    let smallTitle = document.getElementById("smallTitle").value;
    let fullTitle = `${title} - ${smallTitle}`;
    let queryString = `fuzzyTitle=${encodeURIComponent(fullTitle)}&business=阅读`;

    fetch(`/wordReviews?${queryString}`)
      .then(response => response.json())
      .then(data => {
            const formattedData = data.map(item => [
                item.title,
                item.business,
                item.type,
                item.word,
                item.result,
                item.reviewTime.split("T")[0] // 只保留日期部分
            ]);

            // 去重
            const uniqueWords = new Set();
            const uniqueData = formattedData.filter(item => {
                const word = item[3];
                if (!uniqueWords.has(word)) {
                    uniqueWords.add(word);
                    return true;
                }
                return false;
            });

            // 清空缓存
            localStorage.removeItem("wordList");
            localStorage.removeItem("phraseList");
            wordList = [];
            phraseList = [];

            // 填充 Word List 和 Phrase List
            uniqueData.forEach(item => {
                const type = item[2];
                const word = item[3];
                if (type === "单词") {
                    wordList.push(word);
                } else if (type === "短语") {
                    phraseList.push(word);
                }
            });

            // 更新 UI
            updateListUI();

            // 更新文章高亮
            highlightAllWordsAndPhrases();

            // 重新缓存
            localStorage.setItem("wordList", JSON.stringify(wordList));
            localStorage.setItem("phraseList", JSON.stringify(phraseList));
        })
      .catch(error => console.error("查询接口数据失败:", error));
}