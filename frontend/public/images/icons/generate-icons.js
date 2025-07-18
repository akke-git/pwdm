const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// SVG 파일 경로
const svgPath = path.join(__dirname, 'pwdm-icon.svg');

// PWA 아이콘에 필요한 크기 배열
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// 이미지 처리 및 저장 함수
async function generateIcons() {
  try {
    // SVG 파일 읽기
    const svgBuffer = fs.readFileSync(svgPath);
    
    // 각 크기별로 이미지 생성
    for (const size of iconSizes) {
      const outputPath = path.join(__dirname, `icon-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`아이콘 생성 완료: icon-${size}x${size}.png`);
    }
    
    console.log('모든 아이콘 생성이 완료되었습니다.');
  } catch (error) {
    console.error('아이콘 생성 중 오류 발생:', error);
  }
}

generateIcons();
