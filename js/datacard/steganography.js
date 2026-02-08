/**
 * steganography.js - 数据隐写编解码模块
 * 观己 - 静观己心，内外澄明
 * 
 * 将数据编码到图片像素中，以及从图片像素中解码数据
 */

/**
 * 将数据编码到图片像素中
 * @param {ImageData} imageData - Canvas 图片数据
 * @param {Uint8Array} data - 要编码的数据
 * @param {boolean} isEncrypted - 是否为加密数据
 * @returns {boolean} 是否编码成功
 */
DataCard.encodeData = function(imageData, data, isEncrypted = false) {
  const { width, height } = imageData;
  const { DATA_ROWS, MAGIC, MAGIC_V1 } = this;
  const magic = isEncrypted ? MAGIC : MAGIC_V1;
  
  const startY = height - DATA_ROWS;
  const availablePixels = width * DATA_ROWS;
  const availableBytes = availablePixels * 3;
  
  const magicBytes = new TextEncoder().encode(magic);
  const lengthBytes = new Uint8Array(4);
  new DataView(lengthBytes.buffer).setUint32(0, data.length, true);
  
  const totalLength = magicBytes.length + lengthBytes.length + data.length;
  
  if (totalLength > availableBytes) {
    console.error(`数据过大: ${totalLength} > ${availableBytes}`);
    return false;
  }
  
  const allData = new Uint8Array(totalLength);
  allData.set(magicBytes, 0);
  allData.set(lengthBytes, magicBytes.length);
  allData.set(data, magicBytes.length + lengthBytes.length);
  
  let dataIndex = 0;
  for (let y = startY; y < height && dataIndex < allData.length; y++) {
    for (let x = 0; x < width && dataIndex < allData.length; x++) {
      const pixelIndex = (y * width + x) * 4;
      
      if (dataIndex < allData.length) {
        imageData.data[pixelIndex] = allData[dataIndex++];
      }
      if (dataIndex < allData.length) {
        imageData.data[pixelIndex + 1] = allData[dataIndex++];
      }
      if (dataIndex < allData.length) {
        imageData.data[pixelIndex + 2] = allData[dataIndex++];
      }
      imageData.data[pixelIndex + 3] = 255;
    }
  }
  
  return true;
};

/**
 * 从图片像素中解码数据
 * @param {ImageData} imageData - Canvas 图片数据
 * @returns {{data: Uint8Array|null, isEncrypted: boolean}} 解码结果
 */
DataCard.decodeData = function(imageData) {
  const { width, height } = imageData;
  const { DATA_ROWS, MAGIC, MAGIC_V1 } = this;
  
  const startY = Math.max(0, height - DATA_ROWS);
  
  // 读取足够的字节来检测魔数
  const maxMagicLength = Math.max(MAGIC.length, MAGIC_V1.length);
  const headerBytes = [];
  const headerLength = maxMagicLength + 4;
  
  outer: for (let y = startY; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4;
      
      headerBytes.push(imageData.data[pixelIndex]);
      headerBytes.push(imageData.data[pixelIndex + 1]);
      headerBytes.push(imageData.data[pixelIndex + 2]);
      
      if (headerBytes.length >= headerLength) {
        break outer;
      }
    }
  }
  
  // 检测版本
  let isEncrypted = false;
  let magicLength = 0;
  
  // 先检测 V2 (加密版本)
  const magicV2Bytes = new Uint8Array(headerBytes.slice(0, MAGIC.length));
  const magicV2Str = new TextDecoder().decode(magicV2Bytes);
  
  if (magicV2Str === MAGIC) {
    isEncrypted = true;
    magicLength = MAGIC.length;
  } else {
    // 检测 V1 (未加密版本)
    const magicV1Bytes = new Uint8Array(headerBytes.slice(0, MAGIC_V1.length));
    const magicV1Str = new TextDecoder().decode(magicV1Bytes);
    
    if (magicV1Str === MAGIC_V1) {
      isEncrypted = false;
      magicLength = MAGIC_V1.length;
    } else {
      console.error('魔数不匹配');
      return { data: null, isEncrypted: false };
    }
  }
  
  // 读取数据长度
  const lengthBytes = new Uint8Array(headerBytes.slice(magicLength, magicLength + 4));
  const dataLength = new DataView(lengthBytes.buffer).getUint32(0, true);
  
  if (dataLength <= 0 || dataLength > width * height * 3) {
    console.error('数据长度无效:', dataLength);
    return { data: null, isEncrypted: false };
  }
  
  // 读取实际数据
  const totalLength = magicLength + 4 + dataLength;
  const allBytes = [];
  
  outer2: for (let y = startY; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4;
      
      allBytes.push(imageData.data[pixelIndex]);
      allBytes.push(imageData.data[pixelIndex + 1]);
      allBytes.push(imageData.data[pixelIndex + 2]);
      
      if (allBytes.length >= totalLength) {
        break outer2;
      }
    }
  }
  
  const dataStart = magicLength + 4;
  const data = new Uint8Array(allBytes.slice(dataStart, dataStart + dataLength));
  
  return { data, isEncrypted };
};
