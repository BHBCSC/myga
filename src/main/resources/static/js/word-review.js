document.addEventListener("DOMContentLoaded", function () {
    loadQueryParams();
    loadMockData();
    // 先判断是否有缓存数据
    const cachedData = localStorage.getItem("queryResults");
    if (cachedData && JSON.parse(cachedData).length > 0) {
        loadCachedResults();
        loadSortingAndVisibility();
        loadCheckboxState();
    }
});
// 缓存查询结果
function cacheResults(data) {
    localStorage.setItem("queryResults", JSON.stringify(data));
}
function displayResults(data) {
    const tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML = "";

    data.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td><input type="checkbox" class="row-checkbox"></td>
                         <td>${item[0]}</td>
                         <td>${item[1]}</td>
                         <td>${item[2]}</td>
                         <td>${item[3]}</td>
                         <td>${item[4]}</td>
                         <td>${item[5]}</td>`;
        tbody.appendChild(row);
    });

    // 重新加载复选框状态
    loadCheckboxState();
}


// 读取缓存结果
function loadCachedResults() {
    const cachedData = localStorage.getItem("queryResults");
    if (cachedData) {
        displayResults(JSON.parse(cachedData));
    }
}
// 修改查询方法，查询后缓存结果
function queryData() {
    // 清空排序、隐藏列和复选框的缓存
    const queryParams = {
        business: document.getElementById("business").value,
        type: document.getElementById("type").value,
        word: document.getElementById("word").value,
        result: document.getElementById("result").value,
        reviewBegin: formatDateToTimestamp(document.getElementById("reviewBegin").value),
        reviewEnd: formatDateToTimestamp(document.getElementById("reviewEnd").value),
        fuzzyTitle: document.getElementById("fuzzyTitle").value,
        fuzzyWord: document.getElementById("fuzzyWord").value
    };
        // 移除值为 null 或 undefined 的参数，防止传递空字符串
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === "") {
                delete queryParams[key];
            }
        });
    localStorage.setItem("queryParams", JSON.stringify(queryParams));
    localStorage.removeItem("sortingVisibilityCache");
    localStorage.removeItem("checkboxStates");
    // 构造查询参数
    const queryString = new URLSearchParams(queryParams).toString();
    fetch(`/wordReviews?${queryString}`)
          .then(response => response.json())
          .then(data => {
              // 格式化数据为表格所需格式
              const formattedData = data.map(item => [
                  item.title,
                  item.business,
                  item.type,
                  item.word,
                  item.result,
                  item.reviewTime.split("T")[0] // 只保留日期部分
              ]);
              cacheResults(formattedData);
              displayResults(formattedData);
          })
          .catch(error => console.error("查询失败:", error));
}

// 复选框状态缓存
function cacheCheckboxState() {
    const checkboxes = document.querySelectorAll(".row-checkbox");
    const checkboxStates = Array.from(checkboxes).map(checkbox => checkbox.checked);
    localStorage.setItem("checkboxStates", JSON.stringify(checkboxStates));
}
function formatDateToTimestamp(dateStr) {
    return dateStr ? `${dateStr} 00:00:00` : null; // 为空时返回 null，而不是 ""
}

// 读取复选框状态缓存
function loadCheckboxState() {
    const checkboxStates = JSON.parse(localStorage.getItem("checkboxStates"));
    if (checkboxStates) {
        document.querySelectorAll(".row-checkbox").forEach((checkbox, index) => {
            checkbox.checked = checkboxStates[index] || false;
        });
    }
}


// 监听复选框点击事件
document.addEventListener("change", function (event) {
    if (event.target.classList.contains("row-checkbox")) {
        cacheCheckboxState();
    }
});

// 缓存排序和隐藏状态
function cacheSortingAndVisibility(columnIndex, type) {
    let sortingVisibilityCache = JSON.parse(localStorage.getItem("sortingVisibilityCache")) || {};
    sortingVisibilityCache[columnIndex] = type;
    localStorage.setItem("sortingVisibilityCache", JSON.stringify(sortingVisibilityCache));
}

// 读取排序和隐藏状态
function loadSortingAndVisibility() {
    const cache = JSON.parse(localStorage.getItem("sortingVisibilityCache"));
    if (cache) {
        Object.keys(cache).forEach(index => {
            if (cache[index] === "hidden") {
                toggleColumn(parseInt(index));
            } else if (cache[index] === "sorted") {
                sortTable(parseInt(index));
            }
        });
    }
}

function resetQuery() {
    localStorage.removeItem("queryParams");
    document.getElementById("business").value = "";
    document.getElementById("type").value = "单词";
    document.getElementById("word").value = "";
    document.getElementById("result").value = "";
    document.getElementById("reviewBegin").value = "";
    document.getElementById("reviewEnd").value = "";
    document.getElementById("fuzzyTitle").value = "";
    document.getElementById("fuzzyWord").value = "";
}

function loadQueryParams() {
    const savedParams = localStorage.getItem("queryParams");
    if (savedParams) {
            const queryParams = JSON.parse(savedParams); // ✅ 修正：定义 queryParams 变量

                document.getElementById("business").value = queryParams.business || "";
                document.getElementById("type").value = queryParams.type || "";
                document.getElementById("word").value = queryParams.word || "";
                document.getElementById("result").value = queryParams.result || "";
                document.getElementById("fuzzyTitle").value = queryParams.fuzzyTitle || "";
                document.getElementById("fuzzyWord").value = queryParams.fuzzyWord || "";
                // 处理日期格式，防止 undefined 赋值给 input[type="date"]
                document.getElementById("reviewBegin").value = queryParams.reviewBegin ? queryParams.reviewBegin.split(" ")[0] : "";
                document.getElementById("reviewEnd").value = queryParams.reviewEnd ? queryParams.reviewEnd.split(" ")[0] : "";
    }
}

function loadMockData() {
    const mockData = [
        ["12听力testtest3section1", "听力", "单词", "potteries", "没记住", "2025-03-01"],
        ["12听力testtest3section2", "阅读", "单词", "precaution", "记住", "2025-03-02"],
        ["12听力testtest3section3", "听力", "短语", "precaution", "记住", "2025-03-03"],
        ["12听力testtest3section1", "听力", "单词", "precaution", "记住", "2025-03-09"]
    ];

    const tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML = "";

    mockData.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td><input type="checkbox" class="row-checkbox"></td>
                         <td>${item[0]}</td>
                         <td>${item[1]}</td>
                         <td>${item[2]}</td>
                         <td>${item[3]}</td>
                         <td>${item[4]}</td>
                         <td>${item[5]}</td>`;
        tbody.appendChild(row);
    });
}

// 修改隐藏列方法，点击后缓存隐藏状态
function toggleColumn(index) {
    const table = document.getElementById("resultTable");
    for (let row of table.rows) {
        if (row.cells.length > index) {
            row.cells[index].style.display =
                row.cells[index].style.display === "none" ? "" : "none";
        }
    }
    cacheSortingAndVisibility(index, "hidden");
}

function sortTable(index) {
    const table = document.getElementById("resultTable");
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);

    // 检查当前排序状态
    let ascending = table.dataset.sortIndex == index ? !(table.dataset.sortOrder === "asc") : true;

    const sortedRows = rows.sort((a, b) => {
        let valA = a.cells[index].innerText.trim();
        let valB = b.cells[index].innerText.trim();

        // 处理 Review Time 按日期排序
        if (index === 6) {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        } else if (index === 1) {  // 处理 Title 按自然顺序排序（数字 + 文字）
            return ascending ? naturalSort(valA, valB) : naturalSort(valB, valA);
        }

        // 尝试转换为数值进行比较
        let numA = parseFloat(valA);
        let numB = parseFloat(valB);

        if (!isNaN(numA) && !isNaN(numB)) {
            return ascending ? numA - numB : numB - numA;
        }

        return ascending ? valA.localeCompare(valB, 'zh-Hans-CN') : valB.localeCompare(valA, 'zh-Hans-CN');
    });

    // 更新排序状态
    table.dataset.sortIndex = index;
    table.dataset.sortOrder = ascending ? "asc" : "desc";

    // 重新插入排序后的行
    tbody.append(...sortedRows);
    cacheSortingAndVisibility(index, "sorted");

}

// 自然排序函数（处理带数字的字符串）
function naturalSort(a, b) {
    return a.replace(/(\d+)/g, (n) => n.padStart(10, '0'))
            .localeCompare(b.replace(/(\d+)/g, (n) => n.padStart(10, '0')), 'zh-Hans-CN', { numeric: true });
}




function saveReviewResult() {
    const checkboxes = document.querySelectorAll(".row-checkbox");
    const selected = [];
    const unselected = [];

    checkboxes.forEach((checkbox) => {
        const row = checkbox.closest("tr");
        const rowData = Array.from(row.cells).slice(1).map((cell) => cell.innerText);
        const reviewData = {
            title: rowData[0],
            business: rowData[1],
            type: rowData[2],
            word: rowData[3],
            result: checkbox.checked ? "记住" : "没记住",
            review_time: rowData[5]
        };

        if (checkbox.checked) {
            selected.push(reviewData);
        } else {
            unselected.push(reviewData);
        }
    });

    const allData = [...selected, ...unselected];
    const selectedWords = selected.map(item => item.word).join("，");
    const unselectedWords = unselected.map(item => item.word).join("，");
    const message = `
        <p><strong style="color: red">${selected.length}</strong> 条数据 记住了。</p>
        <p><strong style="color: green">${unselected.length}</strong> 条数据 没记住。</p>
        <h3>没记住单词：</h3>
        <p>${unselectedWords || "无"}</p>
        <h3>记住单词：</h3>
        <p>${selectedWords || "无"}</p>
        <button id="confirmBtn">确认</button>
    `;

    // 创建弹窗
    let modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = message;
    document.body.appendChild(modal);

    // 点击确认后，逐个调用接口保存数据
    document.getElementById("confirmBtn").addEventListener("click", function () {
        modal.remove();

        let promises = allData.map(data =>
            fetch('/wordReviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)  // ✅ 这里改成发送单个对象
            })
        );

        Promise.all(promises)
            .then(responses => Promise.all(responses.map(res => res.json())))
            .then(results => {
                alert("数据已成功保存！");
            })
            .catch(error => {
                console.error("保存失败:", error);
                alert("数据保存失败，请重试！");
            });
    });
}
