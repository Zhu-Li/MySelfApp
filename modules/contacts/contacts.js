/**
 * contacts.js - 关系网管理模块（协调器）
 * 观己 - 静观己心，内外澄明
 * 
 * 管理人际关系网络，支持导入他人数据
 * 
 * 此文件为模块协调器，核心功能由以下子文件提供：
 * - list-renderer.js: 联系人列表渲染
 * - detail-renderer.js: 联系人详情页渲染
 * - import-handler.js: 数据导入处理
 * - data-merger.js: 数据合并与覆盖
 * - test-detail.js: 测试详情弹窗
 * - diary-detail.js: 日记详情弹窗
 */

const Contacts = {
  // ========== 临时状态存储 ==========
  _pendingImportData: null,
  _pendingResolve: null,
  _pendingExistingContact: null,
  _importMode: null,
  _selfConflictResolve: null,
  _networkConflictResolve: null,
  _remarkResolve: null,
  _editRemarkResolve: null,

  // ========== 核心数据方法 ==========

  /**
   * 获取所有联系人
   * @returns {Promise<Array>} 联系人列表
   */
  async getAll() {
    return Storage.getAllContacts();
  },

  /**
   * 获取单个联系人
   * @param {string} id - 联系人ID
   * @returns {Promise<Object|null>} 联系人对象
   */
  async get(id) {
    return Storage.getContact(id);
  },

  /**
   * 保存联系人
   * @param {Object} contactData - 联系人数据
   * @returns {Promise<Object>} 保存后的联系人对象
   */
  async save(contactData) {
    return Storage.saveContact(contactData);
  },

  /**
   * 删除联系人
   * @param {string} id - 联系人ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    return Storage.deleteContact(id);
  },

  /**
   * 获取测试结果摘要（与首页显示一致）
   * @param {Object} test - 测试对象
   * @returns {string} 测试结果摘要文本
   */
  getTestResultSummary(test) {
    if (!test.result) return '-';
    const result = test.result;
    
    switch (test.type) {
      case 'mbti':
        return result.type || '-';
      
      case 'bigfive':
        // 显示最高分维度
        if (result.dimensions) {
          const dims = result.dimensions;
          const entries = Object.entries(dims).filter(([k]) => ['O', 'C', 'E', 'A', 'N'].includes(k));
          if (entries.length > 0) {
            const topDim = entries.sort((a, b) => b[1] - a[1])[0];
            return `${topDim[0]}:${topDim[1]}`;
          }
        }
        return '-';
      
      case 'holland':
        // 使用hollandCode
        return result.hollandCode || '-';
      
      case 'attachment':
        // 使用typeInfo.name中文名
        if (result.typeInfo?.name) {
          return result.typeInfo.name;
        }
        // 兼容旧格式，将英文转中文
        const typeMap = {
          'secure': '安全型',
          'anxious': '焦虑型', 
          'avoidant': '回避型',
          'fearful': '恐惧型'
        };
        return typeMap[result.type] || result.type || '-';
      
      case 'eq':
        if (result.overallScore !== undefined) {
          return `${result.overallScore}分`;
        }
        return '-';
      
      case 'values':
        // 使用coreValues
        if (result.coreValues?.length > 0) {
          return result.coreValues[0].dimension || result.coreValues[0].name || result.coreValues[0];
        }
        if (result.topValues?.length > 0) {
          return result.topValues[0];
        }
        return '-';
      
      case 'stress':
        // 使用anxietyLevel.name
        if (result.anxietyLevel?.name) {
          return result.anxietyLevel.name;
        }
        return result.level || '-';
      
      case 'comprehensive':
        return '已完成';
      
      default:
        return '已完成';
    }
  }

  // ========== 以下方法由子文件提供 ==========
  
  // list-renderer.js:
  //   - renderList(container)
  //   - renderContactCard(contact)
  //   - showDetail(id) [导航到详情页]
  //   - addListStyles()
  
  // detail-renderer.js:
  //   - renderDetail(container, contactId)
  //   - editRemark(contactId)
  //   - showEditRemarkDialog(contactName, currentRemark)
  //   - submitEditRemark()
  //   - closeEditRemarkDialog(remark)
  //   - confirmDelete(contactId)
  //   - addDetailStyles()
  
  // import-handler.js:
  //   - importSelfData()
  //   - importNetworkData()
  //   - handleFileSelect(event)
  //   - readAndDecryptZip(file)
  //   - processSelfImport(importData)
  //   - processNetworkImport(importData)
  //   - showSelfConflictDialog(local, imported, importData)
  //   - closeSelfConflictDialog(choice)
  //   - showNetworkConflictDialog(existing, importData)
  //   - closeNetworkConflictDialog(choice)
  //   - showRemarkDialog(contactName)
  //   - submitRemark()
  //   - closeRemarkDialog(remark)
  //   - addNewContact(importData, remark)
  //   - addConflictStyles()
  
  // data-merger.js:
  //   - detectProfileConflicts(local, imported)
  //   - overwriteSelfData(importData)
  //   - mergeSelfData(importData, localProfile)
  //   - mergeArrayById(localArr, importArr, timeField)
  
  // test-detail.js:
  //   - showTestDetail(contactId, testIndex)
  //   - renderTestDetailContent(test)
  //   - renderMBTIDetail(result)
  //   - renderBigFiveDetail(result)
  //   - renderHollandDetail(result)
  //   - renderAttachmentDetail(result)
  //   - renderEQDetail(result)
  //   - renderValuesDetail(result)
  //   - renderStressDetail(result)
  //   - renderComprehensiveDetail(result)
  //   - formatMarkdown(text)
  //   - closeTestDetailModal()
  //   - addTestDetailStyles()
  
  // diary-detail.js:
  //   - showDiaryDetail(contactId, diaryIndex)
  //   - formatDiaryContent(content)
  //   - renderAnalysisContent(analysis)
  //   - viewDiaryImage(diaryId, imageIndex)
  //   - closeDiaryDetailModal()
  //   - viewImage(src)
  //   - showAllDiaries(contactId)
  //   - closeAllDiariesModal()
  //   - addDiaryDetailStyles()
  //   - addAllDiariesStyles()
};

// 导出到全局
window.Contacts = Contacts;
