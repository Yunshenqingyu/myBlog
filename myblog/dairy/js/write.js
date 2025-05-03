/* 鼠标样式 */
const body = document.querySelector("body");
const element = document.getElementById("g-pointer-1");
const element2 = document.getElementById("g-pointer-2");
const halfAlementWidth = element.offsetWidth / 2;
const halfAlementWidth2 = element2.offsetWidth / 2;

function setPosition(x, y) {
  element2.style.transform = `translate(${x - halfAlementWidth2 + 1}px, ${
    y - halfAlementWidth2 + 1
  }px)`;
}

body.addEventListener("mousemove", (e) => {
  window.requestAnimationFrame(function () {
    setPosition(e.clientX, e.clientY);
  });
});

    (function() {
        const memoListElement = document.getElementById('list');
        const addMemoButton = document.getElementById('add-memo');
        const exportZipButton = document.getElementById('export-zip');
        const exportSelectedButton = document.getElementById('export-selected-button');
        const importZipInput = document.getElementById('import-zip');
        const deleteSelectedButton = document.getElementById('delete-selected');
        const selectAllCheckbox = document.getElementById('select-all');
        const searchInput = document.getElementById('search-input');
        const increaseFontButton = document.getElementById('increase-font');
        const decreaseFontButton = document.getElementById('decrease-font');
        const saveNotification = document.getElementById('save-notification');
        const sortSelect = document.getElementById('sort-select');

        const mobileModal = document.getElementById('mobile-modal');
        const continueBtn = document.getElementById('continue-btn');
        const cancelBtn = document.getElementById('cancel-btn');

        // 标题输入框
        const titleInput = document.getElementById('title-input');

        // 新增：TXT 导入相关
        const importTxtInput = document.getElementById('import-txt');

        let memos = {}; 
        let currentMemoId = null;
        let db;
        let isAutoAdding = false; 
        let isModified = false; 
        let currentFontSize = 16; 

        // 初始化 Quill 编辑器
        const quill = new Quill('#editor-container', {
            modules: {
                toolbar: '#toolbar'
            },
            theme: 'snow'
        });

        // 当用户在 Quill 中输入内容时
        quill.on('text-change', function(delta, oldDelta, source) {
            if (source === 'user') {
                if (currentMemoId) {
                    isModified = true;
                } else {
                    // 如果还没有当前 Memo，但是用户开始输入了，则自动添加一个新的 Memo
                    const content = quill.root.innerHTML.trim();
                    if (content !== '<p><br></p>' && content !== '') {
                        isAutoAdding = true;
                        addMemo().then(() => {
                            // 将用户输入的内容恢复到新建的备忘录中
                            quill.setContents(quill.clipboard.convert(content));
                            isAutoAdding = false;
                            isModified = true;
                        });
                    }
                }
            }
        });

        // 标题输入框：只要用户输入，就标记 isModified
        titleInput.addEventListener('input', function() {
            isModified = true;
        });

        // 标题输入框：在失焦时立即保存（可选）
        titleInput.addEventListener('blur', function() {
            if (currentMemoId && isModified) {
                updateCurrentMemo();
                showSaveNotification();
            }
        });

        // 初始化 IndexedDB
        function initDB() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open('MemoDB', 4);

                request.onerror = function(event) {
                    console.error('IndexedDB 初始化失败', event);
                    reject(event);
                };

                request.onsuccess = function(event) {
                    db = event.target.result;
                    resolve();
                };

                request.onupgradeneeded = function(event) {
                    db = event.target.result;
                    if (!db.objectStoreNames.contains('memos')) {
                        const objectStore = db.createObjectStore('memos', { keyPath: 'id' });
                        objectStore.createIndex('title', 'title', { unique: false });
                        objectStore.createIndex('order', 'order', { unique: false });
                    }
                };
            });
        }

        // 从 IndexedDB 加载所有备忘录
        function loadMemos() {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(['memos'], 'readonly');
                const objectStore = transaction.objectStore('memos');
                const request = objectStore.getAll();

                request.onerror = function(event) {
                    console.error('读取备忘录失败', event);
                    reject(event);
                };

                request.onsuccess = function(event) {
                    memos = {};
                    event.target.result.forEach(memo => {
                        memos[memo.id] = { 
                            title: memo.title, 
                            content: memo.content, 
                            pinned: memo.pinned || false, 
                            pinnedUntil: memo.pinnedUntil || null,
                            lastEdit: memo.lastEdit || '未知时间',
                            order: memo.order || Date.now(),
                            versions: memo.versions || [] 
                        };
                    });
                    renderMemoList();
                    resolve();
                };
            });
        }

        // 保存所有备忘录到 IndexedDB
        function saveAllMemos() {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(['memos'], 'readwrite');
                const objectStore = transaction.objectStore('memos');

                // 清空现有数据
                const clearRequest = objectStore.clear();
                clearRequest.onsuccess = function() {
                    // 添加所有 memos
                    const addPromises = [];
                    for (let id in memos) {
                        const memo = { 
                            id: id, 
                            title: memos[id].title, 
                            content: memos[id].content, 
                            pinned: memos[id].pinned, 
                            pinnedUntil: memos[id].pinnedUntil,
                            lastEdit: memos[id].lastEdit,
                            order: memos[id].order,
                            versions: memos[id].versions 
                        };
                        const addRequest = objectStore.add(memo);
                        addPromises.push(new Promise((res, rej) => {
                            addRequest.onsuccess = res;
                            addRequest.onerror = rej;
                        }));
                    }
                    Promise.all(addPromises).then(resolve).catch(reject);
                };
                clearRequest.onerror = function(event) {
                    console.error('清空备忘录失败', event);
                    reject(event);
                };
            });
        }

        // 渲染备忘录列表
        function renderMemoList(filter = '') {
            memoListElement.innerHTML = '';
            const fragment = document.createDocumentFragment();

            // 获取排序方式
            const sortValue = sortSelect.value;

            // 将 memos 转换为数组
            let memosArray = Object.keys(memos).map(id => ({ id, ...memos[id] }));

            // 排序
            switch(sortValue) {
                case 'date-desc':
                    memosArray.sort((a, b) => new Date(b.lastEdit) - new Date(a.lastEdit));
                    break;
                case 'date-asc':
                    memosArray.sort((a, b) => new Date(a.lastEdit) - new Date(b.lastEdit));
                    break;
                case 'name-asc':
                    memosArray.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'custom':
                    memosArray.sort((a, b) => a.order - b.order);
                    break;
                default:
                    // 默认用 id 排序
                    memosArray.sort((a, b) => b.id - a.id);
            }

            // 根据搜索过滤
            memosArray.forEach(memo => {
                const { id, title, content, lastEdit } = memo;
                if (filter) {
                    const lowerFilter = filter.toLowerCase();
                    // 提取纯文本用于搜索
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = content;
                    const textContent = tempDiv.textContent || tempDiv.innerText || '';
                    if (!title.toLowerCase().includes(lowerFilter) && !textContent.toLowerCase().includes(lowerFilter)) {
                        return;
                    }
                }

                const li = document.createElement('li');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.dataset.id = id;
                checkbox.id = `checkbox-${id}`;

                const label = document.createElement('label');
                label.htmlFor = `checkbox-${id}`;
                label.textContent = title || '无标题备忘录';
                label.style.flexGrow = '1';
                label.style.cursor = 'pointer';
                label.style.marginRight = '10px';
                label.style.fontWeight = 'bold';

                const editTime = document.createElement('span');
                editTime.className = 'edit-time';
                editTime.textContent = `最后编辑: ${lastEdit}`;

                li.appendChild(checkbox);
                li.appendChild(label);
                li.appendChild(editTime);
                li.dataset.id = id;

                if (id === currentMemoId) {
                    li.classList.add('active');
                }

                fragment.appendChild(li);
            });

            memoListElement.appendChild(fragment);

            // 初始化 Sortable.js（只有在“自定义排序”时，拖拽排序才真正有用）
            Sortable.create(memoListElement, {
                animation: 150,
                handle: 'label',
                onEnd: function (evt) {
                    const movedItem = memosArray.splice(evt.oldIndex, 1)[0];
                    memosArray.splice(evt.newIndex, 0, movedItem);
                    // 更新 order
                    memosArray.forEach((memo, index) => {
                        memos[memo.id].order = index;
                    });
                    saveAllMemos();
                },
            });
        }

        // 添加新备忘录
        function addMemo() {
            return new Promise((resolve) => {
                const id = 'memo-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
                memos[id] = { 
                    title: '新备忘录', 
                    content: '<p></p>', 
                    pinned: false, 
                    pinnedUntil: null,
                    lastEdit: new Date().toLocaleString(),
                    order: Object.keys(memos).length,
                    versions: [] 
                };
                saveAllMemos().then(() => {
                    renderMemoList();
                    selectMemo(id);
                    resolve();
                });
            });
        }

        // 选择备忘录
        function selectMemo(id) {
            if (isModified) {
                // 保存当前正在编辑的备忘录
                updateCurrentMemo();
                showSaveNotification();
            }
            currentMemoId = id;
            renderMemoList(searchInput.value);

            // 将选中的备忘录内容加载进 Quill
            quill.setContents(quill.clipboard.convert(memos[id].content));

            // 将标题输入框与当前标题同步
            titleInput.value = memos[id].title || '无标题备忘录';

            isModified = false;
            // 恢复字体大小
            const savedFontSize = localStorage.getItem(`fontSize-${id}`);
            if (savedFontSize) {
                quill.root.style.fontSize = `${savedFontSize}px`;
                currentFontSize = parseInt(savedFontSize);
            } else {
                quill.root.style.fontSize = `${currentFontSize}px`;
            }
            // 滚动到视图中
            const selectedLi = memoListElement.querySelector(`li[data-id="${id}"]`);
            if (selectedLi) {
                selectedLi.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // 更新当前备忘录内容并保存版本
        function updateCurrentMemo() {
            if (currentMemoId) {
                const previousContent = memos[currentMemoId].content;
                const newContent = quill.root.innerHTML;

                // 从标题输入框获取最新标题
                const newTitle = titleInput.value.trim();

                const oldTitle = memos[currentMemoId].title;
                if (previousContent !== newContent || oldTitle !== newTitle) {
                    // 保存历史版本
                    memos[currentMemoId].versions.push({
                        content: previousContent,
                        timestamp: new Date().toLocaleString()
                    });

                    // 更新标题和内容
                    memos[currentMemoId].title = newTitle || '无标题备忘录';
                    memos[currentMemoId].content = newContent;
                    memos[currentMemoId].lastEdit = new Date().toLocaleString();

                    // 保存字体大小
                    const fontSize = parseInt(quill.root.style.fontSize) || 16;
                    localStorage.setItem(`fontSize-${currentMemoId}`, fontSize);

                    // 持久化到 IndexedDB
                    saveAllMemos().then(() => {
                        renderMemoList(searchInput.value);
                    });
                }
            }
        }

        // 导出选定备忘录为 ZIP
        async function exportSelectedMemosAsZip() {
            const selectedCheckboxes = memoListElement.querySelectorAll('input[type="checkbox"]:checked');
            if (selectedCheckboxes.length === 0) {
                alert('请先选择要导出的备忘录。');
                return;
            }

            const zip = new JSZip();
            for (let cb of selectedCheckboxes) {
                const id = cb.dataset.id;
                const memo = memos[id];
                const safeTitle = memo.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5-_ ]/g, '') || '无标题';
                // 这里你可自行决定是否在文件名中附加日期
                const fileName = `${safeTitle}.html`;
                zip.file(fileName, memo.content);
            }

            const content = await zip.generateAsync({type:"blob"});
            saveAs(content, "selected_memos.zip");
        }

        // 导出所有备忘录为 ZIP
        async function exportAllMemosAsZip() {
            if (Object.keys(memos).length === 0) {
                alert('没有备忘录可导出。');
                return;
            }

            const zip = new JSZip();
            for (let id in memos) {
                const memo = memos[id];
                const safeTitle = memo.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5-_ ]/g, '') || '无标题';
                const fileName = `${safeTitle}.html`;
                zip.file(fileName, memo.content);
            }
            const content = await zip.generateAsync({type:"blob"});
            saveAs(content, "all_memos.zip");
        }

        // 导入备忘录 ZIP 文件
        function importMemosFromZip(file) {
            return new Promise((resolve, reject) => {
                const zip = new JSZip();
                zip.loadAsync(file)
                    .then(function(zip) {
                        const promises = [];
                        zip.forEach(function (relativePath, zipEntry) {
                            if (!zipEntry.dir && zipEntry.name.endsWith('.html')) {
                                const promise = zipEntry.async('string').then(function(content) {
                                    const baseName = zipEntry.name.replace(/\.html$/i, '');
                                    const id = 'memo-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
                                    memos[id] = { 
                                        title: baseName, 
                                        content: content, 
                                        pinned: false, 
                                        pinnedUntil: null,
                                        lastEdit: '未知时间',
                                        order: Object.keys(memos).length,
                                        versions: [] 
                                    };
                                });
                                promises.push(promise);
                            }
                        });
                        return Promise.all(promises);
                    })
                    .then(function() {
                        saveAllMemos().then(() => {
                            renderMemoList(searchInput.value);
                            showSaveNotification();
                            alert('备忘录导入成功！');
                            resolve();
                        });
                    })
                    .catch(function(err) {
                        console.error(err);
                        alert('导入失败，请确保文件是有效的 ZIP 格式并包含 .html 文件。');
                        reject(err);
                    });
            });
        }

        // 新增：导入 TXT 文件
        function importMemosFromTxt(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const txtContent = e.target.result; // 纯文本字符串
                    // 创建一个新 Memo
                    const id = 'memo-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
                    // 这里 txt 内容我们可以直接放进 memo.content 中，如果要保持原换行，可以简单替换一下换行符
                    const htmlContent = txtContent
                        .split('\n').map(line => `<p>${line}</p>`).join('\n');

                    // 你也可以让用户自己填写标题；此处示例里，取 TXT 文件名做标题
                    const baseName = file.name.replace(/\.txt$/i, '');
                    memos[id] = {
                        title: baseName,
                        content: htmlContent,
                        pinned: false,
                        pinnedUntil: null,
                        lastEdit: new Date().toLocaleString(),
                        order: Object.keys(memos).length,
                        versions: []
                    };
                    // 保存到 IndexedDB 并刷新列表
                    saveAllMemos().then(() => {
                        renderMemoList(searchInput.value);
                        showSaveNotification();
                        alert('TXT 导入成功！');
                        resolve();
                    }).catch(err => {
                        reject(err);
                    });
                };
                reader.onerror = function(err) {
                    alert('读取 TXT 文件出错！');
                    reject(err);
                };
                reader.readAsText(file, 'utf-8');
            });
        }

        // 删除选中的备忘录
        function deleteSelectedMemos() {
            const selectedCheckboxes = memoListElement.querySelectorAll('input[type="checkbox"]:checked');
            if (selectedCheckboxes.length === 0) {
                alert('请先选择要删除的备忘录。');
                return;
            }

            if (!confirm(`确定要删除选中的 ${selectedCheckboxes.length} 个备忘录吗？`)) {
                return;
            }

            selectedCheckboxes.forEach(cb => {
                const id = cb.dataset.id;
                delete memos[id];
                localStorage.removeItem(`fontSize-${id}`);
                if (id === currentMemoId) {
                    currentMemoId = null;
                    quill.setContents([]);
                    titleInput.value = '';
                }
            });

            saveAllMemos().then(() => {
                renderMemoList(searchInput.value);
                if (!currentMemoId && Object.keys(memos).length > 0) {
                    const firstId = Object.keys(memos)[0];
                    selectMemo(firstId);
                }
                selectAllCheckbox.checked = false;
                if (currentMemoId === null) {
                    showSaveNotification();
                }
            });
        }

        // 全选/取消全选功能
        function toggleSelectAll() {
            const isChecked = selectAllCheckbox.checked;
            const checkboxes = memoListElement.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = isChecked;
            });
        }

        // 搜索功能
        function searchMemos() {
            const query = searchInput.value.trim();
            renderMemoList(query);
        }

        // 显示保存通知
        function showSaveNotification() {
            saveNotification.classList.add('show');
            setTimeout(() => {
                saveNotification.classList.remove('show');
            }, 3000);
        }

        // 事件监听
        addMemoButton.addEventListener('click', () => {
            addMemo().then(() => {
                showSaveNotification();
            });
        });

        memoListElement.addEventListener('click', function(e) {
            // 如果点击的是复选框，阻止选择备忘录
            if (e.target && e.target.type === 'checkbox') {
                e.stopPropagation();
                const checkboxes = memoListElement.querySelectorAll('input[type="checkbox"]');
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                selectAllCheckbox.checked = allChecked;
                return;
            }

            if (e.target && (e.target.nodeName === 'LI' || e.target.nodeName === 'LABEL' || e.target.classList.contains('edit-time'))) {
                let li = e.target;
                if (li.nodeName !== 'LI') {
                    li = li.parentElement;
                }
                const id = li.dataset.id;
                if (id) {
                    if (isAutoAdding) return;
                    selectMemo(id);
                }
            }
        });

        exportZipButton.addEventListener('click', exportAllMemosAsZip);
        exportSelectedButton.addEventListener('click', exportSelectedMemosAsZip);

        importZipInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                importMemosFromZip(file).then(() => {
                    showSaveNotification();
                });
                importZipInput.value = '';
            }
        });

        // 监听 TXT 导入
        importTxtInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                importMemosFromTxt(file).then(() => {
                    showSaveNotification();
                }).catch(err => {
                    console.error('TXT 导入失败：', err);
                });
                importTxtInput.value = '';
            }
        });

        deleteSelectedButton.addEventListener('click', deleteSelectedMemos);
        selectAllCheckbox.addEventListener('change', toggleSelectAll);
        searchInput.addEventListener('input', searchMemos);
        sortSelect.addEventListener('change', function() {
            renderMemoList(searchInput.value);
        });

        // 取消编辑时提示保存
        document.addEventListener('click', function(e) {
            const editor = document.getElementById('memo-editor');
            const list = document.getElementById('memo-list');
            if (!editor.contains(e.target) && !list.contains(e.target)) {
                if (isModified && currentMemoId) {
                    updateCurrentMemo();
                    showSaveNotification();
                }
            }
        });

        // 检测屏幕大小并显示提示
        function checkScreenSize() {
            const isSmallScreen = window.innerWidth < 768;
            if (isSmallScreen) {
                openModal(mobileModal);
            }
        }

        // 模态框控制
        function openModal(modal) {
            modal.style.display = 'block';
        }

        function closeModal(modal) {
            modal.style.display = 'none';
        }

        // 处理屏幕大小模态框按钮
        continueBtn.addEventListener('click', function() {
            closeModal(mobileModal);
        });

        cancelBtn.addEventListener('click', function() {
            window.history.back();
        });

        // 初始化应用
        initDB().then(() => {
            return loadMemos();
        }).then(() => {
            applyTheme();
            checkScreenSize();
            if (Object.keys(memos).length === 0) {
                addMemo().then(() => {
                    showSaveNotification();
                });
            }
        }).catch(err => {
            console.error('应用初始化失败', err);
            alert('应用初始化失败，请检查浏览器是否支持 IndexedDB。');
        });

        // 应用主题（自动根据系统偏好）
        function applyTheme() {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = prefersDark ? 'dark' : 'light';
            setTheme(theme);
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                const newTheme = e.matches ? 'dark' : 'light';
                setTheme(newTheme);
            });
        }

        function setTheme(theme) {
            document.body.setAttribute('data-theme', theme);
        }

        // 增大文字功能
        increaseFontButton.addEventListener('click', function() {
            if (currentMemoId) {
                currentFontSize = parseInt(localStorage.getItem(`fontSize-${currentMemoId}`)) || 16;
            }
            if (currentFontSize < 24) {
                currentFontSize += 2;
                quill.root.style.fontSize = `${currentFontSize}px`;
                if (currentMemoId) {
                    localStorage.setItem(`fontSize-${currentMemoId}`, currentFontSize);
                }
            }
        });

        // 减小文字功能
        decreaseFontButton.addEventListener('click', function() {
            if (currentMemoId) {
                currentFontSize = parseInt(localStorage.getItem(`fontSize-${currentMemoId}`)) || 16;
            }
            if (currentFontSize > 12) {
                currentFontSize -= 2;
                quill.root.style.fontSize = `${currentFontSize}px`;
                if (currentMemoId) {
                    localStorage.setItem(`fontSize-${currentMemoId}`, currentFontSize);
                }
            }
        });

    })();