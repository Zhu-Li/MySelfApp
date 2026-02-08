/**
 * image-handler.js - 日记图片处理
 * 观己 - 静观己心，内外澄明
 * 
 * 从 diary.js 拆分
 * 职责：图片压缩、上传、预览和查看器
 */

/**
 * 压缩图片
 * @param {File} file - 图片文件
 * @returns {Promise<Object>} 压缩后的图片数据
 */
Diary.compressImage = async function(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // 按比例缩放
        if (width > this.maxImageSize || height > this.maxImageSize) {
          if (width > height) {
            height = (height / width) * this.maxImageSize;
            width = this.maxImageSize;
          } else {
            width = (width / height) * this.maxImageSize;
            height = this.maxImageSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 转为 Base64
        const base64 = canvas.toDataURL('image/jpeg', this.imageQuality);
        resolve({
          id: Utils.generateId(),
          data: base64,
          name: file.name,
          size: Math.round(base64.length * 0.75), // 估算大小
          width,
          height
        });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 处理图片上传
 * @param {Event} event - 上传事件
 */
Diary.handleImageUpload = async function(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  // 限制最多9张图片
  const remaining = 9 - this.currentImages.length;
  if (remaining <= 0) {
    Utils.showToast('最多只能添加9张图片', 'warning');
    return;
  }

  const filesToProcess = files.slice(0, remaining);
  Utils.showLoading('正在处理图片...');

  try {
    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        Utils.showToast(`${file.name} 不是图片文件`, 'warning');
        continue;
      }

      const compressed = await this.compressImage(file);
      this.currentImages.push(compressed);
    }

    this.renderImagePreview();
    Utils.hideLoading();

  } catch (error) {
    Utils.hideLoading();
    console.error('图片处理失败:', error);
    Utils.showToast('图片处理失败', 'error');
  }

  // 清空 input 以便重复选择同一文件
  event.target.value = '';
};

/**
 * 删除图片
 * @param {string} imageId - 图片ID
 */
Diary.removeImage = function(imageId) {
  this.currentImages = this.currentImages.filter(img => img.id !== imageId);
  this.renderImagePreview();
};

/**
 * 渲染图片预览
 */
Diary.renderImagePreview = function() {
  const container = document.getElementById('imagePreviewContainer');
  const countHint = document.getElementById('imageCountHint');
  
  if (countHint) {
    countHint.textContent = this.currentImages.length > 0 
      ? `已选择 ${this.currentImages.length} 张` 
      : '支持 JPG、PNG 格式';
  }

  if (!container) return;

  if (this.currentImages.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="image-preview-grid">
      ${this.currentImages.map(img => `
        <div class="image-preview-item" data-id="${img.id}">
          <img src="${img.data}" alt="${img.name}">
          <button type="button" class="image-remove-btn" onclick="Diary.removeImage('${img.id}')">
            ✕
          </button>
        </div>
      `).join('')}
    </div>
  `;
};

/**
 * 显示图片查看器
 * @param {string} diaryId - 日记ID
 * @param {number} initialIndex - 初始图片索引
 */
Diary.showImageViewer = async function(diaryId, initialIndex = 0) {
  const diary = await this.get(diaryId);
  if (!diary || !diary.images || diary.images.length === 0) return;

  let currentIndex = initialIndex;
  const images = diary.images;

  const updateViewer = () => {
    const img = document.getElementById('viewerImage');
    const counter = document.getElementById('viewerCounter');
    if (img) img.src = images[currentIndex].data;
    if (counter) counter.textContent = `${currentIndex + 1} / ${images.length}`;
  };

  // 创建查看器
  const viewer = document.createElement('div');
  viewer.id = 'imageViewer';
  viewer.className = 'image-viewer';
  viewer.innerHTML = `
    <div class="image-viewer-backdrop" onclick="Diary.closeImageViewer()"></div>
    <div class="image-viewer-content">
      <img id="viewerImage" src="${images[currentIndex].data}" alt="查看图片">
      <div class="image-viewer-controls">
        <button class="btn btn-ghost" onclick="Diary.viewerPrev()" ${images.length <= 1 ? 'disabled' : ''}>
          ◀ 上一张
        </button>
        <span id="viewerCounter" class="text-secondary">${currentIndex + 1} / ${images.length}</span>
        <button class="btn btn-ghost" onclick="Diary.viewerNext()" ${images.length <= 1 ? 'disabled' : ''}>
          下一张 ▶
        </button>
      </div>
      <button class="image-viewer-close" onclick="Diary.closeImageViewer()">✕</button>
    </div>
  `;

  document.body.appendChild(viewer);
  document.body.style.overflow = 'hidden';

  // 存储状态和方法到临时对象
  this._viewer = {
    currentIndex,
    images,
    update: updateViewer
  };
};

/**
 * 查看器：上一张
 */
Diary.viewerPrev = function() {
  if (!this._viewer) return;
  this._viewer.currentIndex = (this._viewer.currentIndex - 1 + this._viewer.images.length) % this._viewer.images.length;
  this._viewer.update();
};

/**
 * 查看器：下一张
 */
Diary.viewerNext = function() {
  if (!this._viewer) return;
  this._viewer.currentIndex = (this._viewer.currentIndex + 1) % this._viewer.images.length;
  this._viewer.update();
};

/**
 * 关闭图片查看器
 */
Diary.closeImageViewer = function() {
  const viewer = document.getElementById('imageViewer');
  if (viewer) {
    viewer.remove();
    document.body.style.overflow = '';
    this._viewer = null;
  }
};
