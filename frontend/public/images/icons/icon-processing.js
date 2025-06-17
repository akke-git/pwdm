const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// 원본 이미지 경로 (새로 업로드된 이미지 경로)
const sourceImagePath = path.join(__dirname, 'pwdm-icon.png');

// PWA 아이콘에 필요한 크기 배열
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// 이미지 처리 및 저장 함수
async function processAndSaveIcons() {
  try {
    // 원본 이미지 로드
    const image = await loadImage(sourceImagePath);
    
    // 각 크기별로 이미지 생성
    for (const size of iconSizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // 이미지 그리기 (원본 이미지를 캔버스 크기에 맞게 조정)
      ctx.drawImage(image, 0, 0, size, size);
      
      // 파일로 저장
      const outputPath = path.join(__dirname, `icon-${size}x${size}.png`);
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      
      stream.pipe(out);
      out.on('finish', () => {
        console.log(`아이콘 생성 완료: ${outputPath}`);
      });
    }
    
    console.log('모든 아이콘 생성 작업이 시작되었습니다.');
  } catch (error) {
    console.error('아이콘 생성 중 오류 발생:', error);
  }
}

processAndSaveIcons();
