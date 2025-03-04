// 新增返回顶部功能
const backToTop = document.getElementById('back-to-top');
const titleSearchInput = document.getElementById('titleSearchInput');
const titleSearchButton = document.getElementById('titleSearchButton');
const globalSpeedSelect = document.getElementById('globalSpeedSelect');

globalSpeedSelect.addEventListener('change', function () {
    const newSpeed = parseFloat(this.value);
    // 更新所有音频的播放速度
    for (let audioUrl in audioCache) {
        const audio = audioCache[audioUrl];
        audio.playbackRate = newSpeed;
    }
    // 更新表格中每个音频对应的速度选择框的值
    const speedSelects = document.querySelectorAll('table tbody tr td select');
    speedSelects.forEach(select => {
        const options = select.options;
        for (let i = 0; i < options.length; i++) {
            if (parseFloat(options[i].value) === newSpeed) {
                select.selectedIndex = i;
                break;
            }
        }
    });
    // 如果有正在播放的音频，更新其播放速度
    if (currentlyPlayingAudio) {
        currentlyPlayingAudio.playbackRate = newSpeed;
    }
});

titleSearchButton.addEventListener('click', function () {
    const searchTitle = titleSearchInput.value;
    if (searchTitle) {
        // 保存搜索框内容到 localStorage
        localStorage.setItem('searchTitle', searchTitle);
        // 调用搜索接口
        fetch(`/savedAudioClips?title=${searchTitle}`)
          .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP 错误! 状态码: ${response.status}`);
                }
                return response.json();
            })
          .then(data => {
                processData(data);
            })
          .catch(error => {
                console.error('获取数据失败:', error.message);
            });
    } else {
        localStorage.removeItem('searchTitle');
        fetch(`/savedAudioClips`)
                  .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP 错误! 状态码: ${response.status}`);
                        }
                        return response.json();
                    })
                  .then(data => {
                        processData(data);
                    })
                  .catch(error => {
                        console.error('获取数据失败:', error.message);
                    });
    }
});

// 滚动显示/隐藏按钮
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

// 点击返回顶部
backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

const nextLoopButton = document.getElementById('nextLoopButton');
const prevLoopButton = document.getElementById('prevLoopButton');
const stopButton = document.getElementById('stopButton');
const audioTable = document.getElementById('audioTable');
const tableBody = audioTable.getElementsByTagName('tbody')[0];
const currentIdDisplay = document.getElementById('currentId');
const previousIdDisplay = document.getElementById('previousId');
const tooltip = document.getElementById('tooltip'); // 获取浮窗元素

let audioCache = {}; // 用于缓存已加载的音频
let currentIndex = -1; // 当前播放索引，初始化为 -1 表示没有播放
let isLoopingAll = false;
let stopFlag = false;
let currentlyPlayingIndex = -1;
let highlightedRow = null;

let currentlyPlayingAudio = null;

// 从 localStorge 中获取数据并更新显示
function updateIdDisplayFromLocalStorage() {
    const storedData = localStorage.getItem('loopIds');
    if (storedData) {
        const { currentId, previousId } = JSON.parse(storedData);
        currentIdDisplay.textContent = currentId;
        previousIdDisplay.textContent = previousId;
    }
}

// 调用函数更新显示
updateIdDisplayFromLocalStorage();

// 从接口获取数据
// 检查 localStorage 中是否有搜索标题
const storedSearchTitle = localStorage.getItem('searchTitle');
if (storedSearchTitle) {
    // 如果有，使用搜索接口
    fetch(`/savedAudioClips?title=${storedSearchTitle}`)
      .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP 错误! 状态码: ${response.status}`);
            }
            return response.json();
        })
      .then(data => {
            processData(data);
            // 将搜索框内容填充
            titleSearchInput.value = storedSearchTitle;
        })
      .catch(error => {
            console.error('获取数据失败:', error.message);
        });
} else {
    // 如果没有，使用原接口
    fetch('/savedAudioClips')
      .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP 错误! 状态码: ${response.status}`);
            }
            return response.json();
        })
      .then(data => {
            processData(data);
        })
      .catch(error => {
            console.error('获取数据失败:', error.message);
        });
}

previousIdDisplay.addEventListener('click', function () {
    const previousId = this.textContent;
    if (previousId!== '无') {
        const rows = tableBody.rows;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const idCell = row.cells[0];
            if (idCell.textContent === previousId) {
                row.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                if (highlightedRow) {
                    highlightedRow.classList.remove('highlight');
                }
                highlightedRow = row;
                highlightedRow.classList.add('highlight');
                currentlyPlayingIndex = i;
                const audioUrl = `/audio/${row.cells[1].querySelector('a').textContent}.mp3`;
                const audio = getAudio(audioUrl);
                const a = parseFloat(row.cells[5].textContent);
                const b = parseFloat(row.cells[6].textContent);
                const speed = parseFloat(globalSpeedSelect.value);
                playLoop(audio, a, b, speed);
                updateCurrentAndPreviousId(previousId);
                break;
            }
        }
    }
});

function processData(data) {
    tableBody.innerHTML = '';

    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const { id, title, word, phrase, text, dataTranslation, pointA, pointB } = item;
        if (id && title) {
            const audioUrl = `/audio/${title}.mp3`;

            const newRow = tableBody.insertRow();
            const idCell = newRow.insertCell(0);
            const titleCell = newRow.insertCell(1);
            const wordCell = newRow.insertCell(2);
            const phraseCell = newRow.insertCell(3);
            const textCell = newRow.insertCell(4);
            const aCell = newRow.insertCell(5);
            const bCell = newRow.insertCell(6);
            const speedCell = newRow.insertCell(7);
            const loopButtonCell = newRow.insertCell(8);
            const stopRowButtonCell = newRow.insertCell(9);

            // 填充 id 单元格
            idCell.textContent = id;

            // 填充 title 单元格
            const titleLink = document.createElement('a');
            titleLink.href = audioUrl;
            titleLink.textContent = title;
            titleCell.appendChild(titleLink);

            // 处理 word 单元格
            wordCell.textContent = word || '';
            wordCell.style.cursor = 'pointer';
            wordCell.addEventListener('click', function (event) {
                event.stopPropagation();
                const translation = dataTranslation || '暂无翻译';
                showTextModal(translation);
            });

            // 处理 phrase 单元格
            phraseCell.textContent = phrase || '';
            phraseCell.style.cursor = 'pointer';
            phraseCell.addEventListener('click', function (event) {
                event.stopPropagation();
                const textContent = text || '暂无内容';
                showTextModal(textContent);
            });

            // 处理 text 单元格
            textCell.textContent = text || '';
            if (text && dataTranslation) {
                textCell.style.cursor = 'pointer';
                textCell.addEventListener('click', function (event) {
                    event.stopPropagation(); // 阻止事件冒泡
                    if (tooltip.style.display === 'none') {
                        tooltip.textContent = dataTranslation;
                        tooltip.style.display = 'block';
                        tooltip.style.left = event.pageX + 'px';
                        tooltip.style.top = event.pageY + 'px';
                    } else {
                        tooltip.style.display = 'none';
                    }
                });
            }

            // 填充 a 点和 b 点单元格
            aCell.textContent = pointA;
            bCell.textContent = pointB;

            // 创建速度选择框
            const speedSelect = document.createElement('select');
            const speedOptions = [0.6, 0.8, 1.0, 1.2, 1.3, 1.5];
            speedOptions.forEach(optionValue => {
                const option = document.createElement('option');
                option.value = optionValue;
                option.textContent = optionValue;
                if (optionValue === 1.0) {
                    option.selected = true;
                }
                speedSelect.appendChild(option);
            });
            speedCell.appendChild(speedSelect);

            // 创建循环片段按钮
            const loopButton = document.createElement('button');
            loopButton.textContent = '循环片段';
            loopButton.addEventListener('click', function () {
                const selectedSpeed = parseFloat(speedSelect.value);
                const a = parseFloat(aCell.textContent);
                const b = parseFloat(bCell.textContent);
                const audio = getAudio(audioUrl);
                playLoop(audio, a, b, selectedSpeed);
                currentIndex = i; // 更新当前播放索引
                updateCurrentAndPreviousId(idCell.textContent); // 更新当前和之前播放的音频 ID 显示
            });
            loopButtonCell.appendChild(loopButton);

            // 创建停止播放按钮
            const stopRowButton = document.createElement('button');
            stopRowButton.textContent = '停止播放';
            stopRowButton.addEventListener('click', function () {
                if (currentlyPlayingAudio) {
                    // 移除之前的 timeupdate 事件监听器
                    if (currentlyPlayingAudio._timeupdateHandler) {
                        currentlyPlayingAudio.removeEventListener('timeupdate', currentlyPlayingAudio._timeupdateHandler);
                    }
                    currentlyPlayingAudio.pause();
                    currentlyPlayingAudio = null;
                }
            });
            stopRowButtonCell.appendChild(stopRowButton);
        }
    }
}

function getAudio(audioUrl) {
    if (!audioCache[audioUrl]) {
        audioCache[audioUrl] = new Audio(audioUrl);
    }
    return audioCache[audioUrl];
}

function showTextModal(text) {
    const modalText = document.getElementById('modalText');
    modalText.textContent = text;
    const textModal = document.getElementById('textModal');
    textModal.style.display = 'flex';
    textModal.addEventListener('click', function (event) {
        if (event.target === textModal) {
            textModal.style.display = 'none';
        }
    });
}

function playLoop(audio, a, b, speed) {
    // 停止当前正在播放的音频
    if (currentlyPlayingAudio) {
        currentlyPlayingAudio.pause();
        // 移除之前的 timeupdate 事件监听器
        if (currentlyPlayingAudio._timeupdateHandler) {
            currentlyPlayingAudio.removeEventListener('timeupdate', currentlyPlayingAudio._timeupdateHandler);
        }
        // 移除可能的事件监听器，这里假设没有额外的监听器，如果有，需要在这里移除
        currentlyPlayingAudio = null;
    }

    currentlyPlayingAudio = audio;
    audio.currentTime = a;
    audio.playbackRate = speed;

    // 定义新的 timeupdate 事件监听器
    audio._timeupdateHandler = function() {
        // 当音频播放到 b 点时
        if (audio.currentTime >= b) {
            // 重新设置播放时间为 a 点，实现循环播放
            audio.currentTime = a;
        }
    };

    // 添加新的 timeupdate 事件监听器
    audio.addEventListener('timeupdate', audio._timeupdateHandler);

    // 开始播放音频
    audio.play();
}

function updateCurrentAndPreviousId(newId) {
    const previousId = currentIdDisplay.textContent;
    currentIdDisplay.textContent = newId;
    previousIdDisplay.textContent = previousId;
    // 将当前和上一次循环的 ID 存储到 localStorage 中
    localStorage.setItem('loopIds', JSON.stringify({
        currentId: newId,
        previousId: previousId
    }));
}

stopButton.addEventListener('click', function () {
    if (currentlyPlayingAudio) {
        // 移除之前的 timeupdate 事件监听器
        if (currentlyPlayingAudio._timeupdateHandler) {
            currentlyPlayingAudio.removeEventListener('timeupdate', currentlyPlayingAudio._timeupdateHandler);
        }
        currentlyPlayingAudio.pause();
        currentlyPlayingAudio = null;
    }
});

// 前一个循环按钮点击事件
prevLoopButton.addEventListener('click', function () {
    if (currentIndex > 0) {
        currentIndex--;
        const row = tableBody.rows[currentIndex];
        if (highlightedRow) {
            highlightedRow.classList.remove('highlight');
        }
        highlightedRow = row;
        highlightedRow.classList.add('highlight');
        row.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        const audioUrl = `/audio/${row.cells[1].querySelector('a').textContent}.mp3`;
        const audio = getAudio(audioUrl);
        const a = parseFloat(row.cells[5].textContent);
        const b = parseFloat(row.cells[6].textContent);
        const speed = parseFloat(globalSpeedSelect.value);
        playLoop(audio, a, b, speed);
        updateCurrentAndPreviousId(row.cells[0].textContent);
    }
});

// 下一个循环按钮点击事件
nextLoopButton.addEventListener('click', function () {
    if (currentIndex < tableBody.rows.length - 1) {
        currentIndex++;
        const row = tableBody.rows[currentIndex];
        if (highlightedRow) {
            highlightedRow.classList.remove('highlight');
        }
        highlightedRow = row;
        highlightedRow.classList.add('highlight');
        row.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        const audioUrl = `/audio/${row.cells[1].querySelector('a').textContent}.mp3`;
        const audio = getAudio(audioUrl);
        const a = parseFloat(row.cells[5].textContent);
        const b = parseFloat(row.cells[6].textContent);
        const speed = parseFloat(globalSpeedSelect.value);
        playLoop(audio, a, b, speed);
        updateCurrentAndPreviousId(row.cells[0].textContent);
    }
});

