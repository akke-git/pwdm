import { Request, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { PasswordItem, User, PasswordHistory } from '../models/index';
import { encrypt, decrypt as decryptPassword, regenerateKeyFromPassword, checkPasswordStrength } from '../utils/encryption';
import { PasswordItemService } from '../services/passwordItemService';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'import-' + uniqueSuffix + '.json');
  }
});

export const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // JSON 파일만 허용
    if (file.mimetype !== 'application/json') {
      return cb(new Error('JSON 파일만 업로드할 수 있습니다.'));
    }
    cb(null, true);
  }
});

// 파일 업로드를 위한 Request 타입 확장
interface FileRequest extends Request {
  file?: Express.Multer.File;
}

import { IPasswordItemCreationAttributes } from '../types/passwordItemTypes'; // IPasswordItemCreationAttributes 임포트 추가

/**
 * 새 비밀번호 항목 생성
 */
export const createPasswordItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // PasswordItemService를 사용하여 비밀번호 항목 생성 로직 호출
    const passwordItem = await PasswordItemService.create(userId, req.body);
    
    // 성공 응답 반환
    res.status(201).json({
      success: true,
      message: '비밀번호 항목이 성공적으로 생성되었습니다.',
      data: {
        id: passwordItem.id,
        title: passwordItem.title,
        url: passwordItem.url,
        username: passwordItem.username,
        category: passwordItem.category,
        tags: passwordItem.tags,
        isFavorite: passwordItem.isFavorite,
        createdAt: passwordItem.createdAt,
        // 필요한 경우 더 많은 데이터를 포함할 수 있습니다.
      },
    });
  } catch (error: any) {
    console.error('비밀번호 항목 생성 오류:', error);
    // 서비스에서 설정한 statusCode가 있다면 해당 코드를 사용, 없다면 500
    const statusCode = error.statusCode || 500;
    const message = error.message || '서버 오류가 발생했습니다.';
    
    res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};

/**
 * 사용자의 모든 비밀번호 항목 조회
 */
export const getAllPasswordItems = async (req: Request, res: Response) => {
  try {
    // (req as any).user.id가 문자열일 수 있으므로 숫자로 변환합니다.
    // JWT 토큰의 id가 숫자임을 가정합니다. 만약 문자열 ID를 사용한다면 서비스 및 모델 타입도 맞춰야 합니다.
    const userIdString = (req as any).user.id;
    if (!userIdString) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID를 찾을 수 없습니다.'
      });
    }
    const userId = parseInt(userIdString, 10);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID 형식입니다.'
      });
    }

    // req.query의 값들은 문자열일 수 있으므로, 타입에 맞게 전달합니다.
    const queryParams = {
      category: req.query.category as string | undefined,
      favorite: req.query.favorite as string | undefined,
      search: req.query.search as string | undefined,
      decrypt: req.query.decrypt as string | undefined,
    };

    const passwordItems = await PasswordItemService.getAll(userId, queryParams);
    
    res.status(200).json({
      success: true,
      count: passwordItems.length,
      data: passwordItems,
    });

  } catch (error: any) {
    console.error('비밀번호 항목 조회 오류:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || '서버 오류가 발생했습니다.';
    
    res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};

/**
 * 특정 비밀번호 항목 조회
 */
export const getPasswordItem = async (req: Request, res: Response) => {
  try {
    const userIdString = (req as any).user.id;
    const itemIdString = req.params.id;

    if (!userIdString) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID를 찾을 수 없습니다.'
      });
    }
    if (!itemIdString) {
      return res.status(400).json({
        success: false,
        message: '항목 ID를 찾을 수 없습니다.'
      });
    }

    const userId = parseInt(userIdString, 10);
    const itemId = parseInt(itemIdString, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID 형식입니다.'
      });
    }
    if (isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 항목 ID 형식입니다.'
      });
    }

    const passwordItem = await PasswordItemService.getById(userId, itemId);

    if (passwordItem) {
      res.status(200).json({
        success: true,
        data: passwordItem,
      });
    } else {
      // 서비스에서 null을 반환하는 경우는 getById 로직상 발생하지 않지만, 방어적으로 처리
      // 실제로는 서비스에서 오류를 throw하므로 catch 블록에서 처리됨
      return res.status(404).json({
        success: false,
        message: '비밀번호 항목을 찾을 수 없습니다.'
      });
    }

  } catch (error: any) {
    console.error('비밀번호 항목 조회 오류:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || '서버 오류가 발생했습니다.';
    
    res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};

/**
 * 비밀번호 항목 업데이트
 */
export const updatePasswordItem = async (req: Request, res: Response) => {
  try {
    const userIdString = (req as any).user.id;
    const itemIdString = req.params.id;
    const updateDataFromRequest: Partial<IPasswordItemCreationAttributes> = req.body;

    if (!userIdString) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID를 찾을 수 없습니다.'
      });
    }
    if (!itemIdString) {
      return res.status(400).json({
        success: false,
        message: '항목 ID를 찾을 수 없습니다.'
      });
    }

    const userId = parseInt(userIdString, 10);
    const itemId = parseInt(itemIdString, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID 형식입니다.'
      });
    }
    if (isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 항목 ID 형식입니다.'
      });
    }

    // 서비스로 전달할 업데이트 데이터 준비. id, userId, createdAt, updatedAt 등은 변경하지 않도록 필터링 가능.
    // 여기서는 PasswordItemService.update 메소드 내에서 비밀번호 암호화 등을 처리하므로, 클라이언트가 보낸 데이터를 전달합니다.
    // 특정 필드의 업데이트를 막고 싶다면 여기서 delete를 사용할 수 있습니다.
    // 예: delete updateDataFromRequest.id; delete updateDataFromRequest.userId;
    const allowedUpdates = { ...updateDataFromRequest };

    const updatedPasswordItem = await PasswordItemService.update(userId, itemId, allowedUpdates);

    res.status(200).json({
      success: true,
      message: '비밀번호 항목이 성공적으로 업데이트되었습니다.',
      data: updatedPasswordItem, // 서비스에서 반환된 객체 (암호화된 비밀번호 포함)
    });

  } catch (error: any) {
    console.error('비밀번호 항목 업데이트 오류:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || '서버 오류가 발생했습니다.';
    
    res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};

/**
 * 비밀번호 항목 삭제
 */
export const deletePasswordItem = async (req: Request, res: Response) => {
  try {
    const userIdString = (req as any).user.id;
    const itemIdString = req.params.id;

    if (!userIdString) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID를 찾을 수 없습니다.'
      });
    }
    if (!itemIdString) {
      return res.status(400).json({
        success: false,
        message: '항목 ID를 찾을 수 없습니다.'
      });
    }

    const userId = parseInt(userIdString, 10);
    const itemId = parseInt(itemIdString, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID 형식입니다.'
      });
    }
    if (isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 항목 ID 형식입니다.'
      });
    }

    await PasswordItemService.delete(userId, itemId);
    
    res.status(200).json({
      success: true,
      message: '비밀번호 항목이 성공적으로 삭제되었습니다.',
    });
  } catch (error: any) {
    console.error('비밀번호 항목 삭제 오류:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || '서버 오류가 발생했습니다.';
    
    res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};

/**
 * 비밀번호 항목 내보내기 (암호화된 JSON 형식)
 */
export const exportPasswordItems = async (req: Request, res: Response) => {
  let filePath: string | undefined;
  try {
    const userId = (req as any).user.id;
    // userId 유효성 검사 (숫자인지 확인)
    if (isNaN(parseInt(userId, 10))) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID 형식입니다.'
      });
    }

    const { ids } = req.body; // 내보낼 항목 ID 배열 (선택적)

    // 사용자 정보 가져오기
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // PasswordItemService를 사용하여 복호화된 항목 데이터 가져오기
    // ids 파라미터는 현재 getAllDecryptedItemsForUser에서 사용하지 않지만, 추후 선택적 내보내기를 위해 남겨둘 수 있음
    const decryptedItems = await PasswordItemService.getAllDecryptedItemsForUser(parseInt(userId, 10));

    const exportData = {
      version: "1.0.0", // 내보내기 파일 버전
      exportedAt: new Date().toISOString(),
      items: decryptedItems
    };

    const exportId = uuidv4();
    const exportFileName = `password-export-${userId}-${exportId}.json`; // 파일명에 userId 추가

    const tempDir = path.join(__dirname, '../../temp/exports'); // exports 하위 디렉토리 사용
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    filePath = path.join(tempDir, exportFileName);
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf8');

    res.download(filePath, exportFileName, (err) => {
      if (err) {
        console.error('파일 다운로드 중 오류 발생:', err);
        // 오류 발생 시에도 파일 삭제 시도 (파일이 존재한다면)
        if (filePath && fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (unlinkErr) {
            console.error('다운로드 오류 후 임시 파일 삭제 실패:', unlinkErr);
          }
        }
        // 클라이언트에게 오류 응답을 보내지 않았을 경우 (이미 헤더가 전송되었을 수 있음)
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: '파일을 내보내는 중 오류가 발생했습니다.'
          });
        }
        return;
      } // res.download 콜백 내의 if(err) 블록 종료

      // 성공적으로 다운로드 완료 후 임시 파일 삭제
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.error('내보내기 성공 후 임시 파일 삭제 실패:', unlinkErr);
        }
      }
    }); // res.download 콜백 종료
  } catch (error: any) { // exportPasswordItems 함수의 메인 try 블록에 대한 catch 블록
    console.error('비밀번호 항목 내보내기 오류:', error);
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (unlinkErr) {
            console.error('오류 발생 후 임시 내보내기 파일 삭제 실패:', unlinkErr);
        }
    }
    res.status(500).json({
      success: false,
      message: '파일을 내보내는 중 예기치 않은 오류가 발생했습니다.'
    });
  }
}; // exportPasswordItems 함수 종료
export const importPasswordItems = async (req: FileRequest, res: Response) => {
  try {
    const userIdString = (req as any).user.id;
    if (!userIdString) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID를 찾을 수 없습니다.'
      });
    }
    const userId = parseInt(userIdString, 10);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID 형식입니다.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '가져올 파일이 없습니다.'
      });
    }

    const filePath = req.file.path;

    // 파일 내용 파싱
    let importData;
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      importData = JSON.parse(fileContent);
    } catch (e) {
      // 파일 읽기 또는 파싱 오류 시 임시 파일 삭제 후 오류 응답
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        message: '잘못된 형식의 파일이거나 파일을 읽을 수 없습니다.'
      });
    }

    // 파일 형식 검증 (기본적인 구조만 확인)
    if (!importData || typeof importData !== 'object' || !Array.isArray(importData.items)) {
       // 파일 형식 오류 시 임시 파일 삭제 후 오류 응답
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        message: '지원되지 않는 파일 형식이거나 items 배열이 없습니다.'
      });
    }

    // PasswordItemService를 사용하여 항목 가져오기 로직 호출
    const results = await PasswordItemService.importItems(userId, importData.items);

    // 임시 파일 삭제
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      success: true,
      message: '비밀번호 항목 가져오기가 완료되었습니다.',
      results: {
        total: importData.items.length,
        ...results
      }
    });

  } catch (error: any) {
    console.error('비밀번호 항목 가져오기 처리 중 오류:', error);
    // req.file이 존재하고, 아직 파일이 삭제되지 않았다면 삭제 시도
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('임시 파일 삭제 중 오류 발생:', unlinkError);
      }
    }
    const statusCode = error.statusCode || 500;
    const message = error.message || '서버에서 오류가 발생했습니다. 파일을 가져오지 못했습니다.';
    res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};

/**
 * 만료 예정인 비밀번호 항목 조회
 */
export const getExpiringPasswordItems = async (req: Request, res: Response) => {
  try {
    const userIdString = (req as any).user.id;
    if (!userIdString) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID를 찾을 수 없습니다.'
      });
    }

    const userId = parseInt(userIdString, 10);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID 형식입니다.'
      });
    }

    const { days: daysQuery, date: dateQuery } = req.query;

    let days: number | undefined;
    if (daysQuery && typeof daysQuery === 'string') {
      const parsedDays = parseInt(daysQuery, 10);
      if (!isNaN(parsedDays)) {
        days = parsedDays;
      }
    }

    const date = dateQuery && typeof dateQuery === 'string' ? dateQuery : undefined;

    const expiringItems = await PasswordItemService.getExpiringItems(userId, days, date);

    res.status(200).json({
      success: true,
      count: expiringItems.length,
      data: expiringItems,
    });
  } catch (error: any) {
    console.error('만료 예정 비밀번호 항목 조회 오류:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || '서버 오류가 발생했습니다.';
    res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};

/**
 * 비밀번호 사용 기록 추적
 */
export const trackPasswordUsage = async (req: Request, res: Response) => {
  try {
    const userIdString = (req as any).user.id;
    const itemIdString = req.params.id;

    if (!userIdString) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID를 찾을 수 없습니다.'
      });
    }
    if (!itemIdString) {
      return res.status(400).json({
        success: false,
        message: '항목 ID를 찾을 수 없습니다.'
      });
    }

    const userId = parseInt(userIdString, 10);
    const itemId = parseInt(itemIdString, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID 형식입니다.'
      });
    }
    if (isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 항목 ID 형식입니다.'
      });
    }

    const { action } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    await PasswordItemService.trackUsageAndUpdateLastUsed(
      userId,
      itemId,
      action || 'view', // action이 없으면 기본값 'view'
      userAgent,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: '비밀번호 사용 기록이 저장되었습니다.'
    });
  } catch (error: any) {
    console.error('비밀번호 사용 기록 저장 오류:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || '서버 오류가 발생했습니다.';
    res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};
