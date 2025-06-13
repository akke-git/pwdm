// backend/src/services/passwordItemService.ts
import { User, PasswordItem, PasswordHistory } from '../models/index';
import { encrypt, decrypt as decryptPassword } from '../utils/encryption';
import { IPasswordItemCreationAttributes, IPasswordItemAttributes } from '../types/passwordItemTypes';
import { Op, WhereOptions, Model, Attributes } from 'sequelize'; // Model, Attributes 추가

interface GetAllPasswordItemsQueryParams {
  category?: string;
  favorite?: string;
  search?: string;
  decrypt?: string;
}

// PasswordItem 모델의 실제 속성 타입을 얻기 위한 헬퍼 타입 (Sequelize v6+)
// PasswordItem.getAttributes() 를 직접 사용할 수 없으므로, IPasswordItemAttributes를 최대한 모델과 일치시킵니다.
// Sequelize 모델의 속성은 Model['_attributes'] 형태로 접근이 어렵거나 불안정할 수 있습니다.
// IPasswordItemAttributes가 모델과 잘 동기화되도록 유지하는 것이 중요합니다.

export class PasswordItemService {
  // userId 타입을 number로 변경 (모델과 일치)
  static async create(userId: number, passwordData: Partial<IPasswordItemCreationAttributes>): Promise<PasswordItem> {
    const { title, url, username, password, category, tags, notes, isFavorite, expiryDate } = passwordData;

    if (!title || !password) {
      const error = new Error('제목과 비밀번호는 필수 입력 항목입니다.');
      (error as any).statusCode = 400;
      throw error;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('사용자를 찾을 수 없습니다.');
      (error as any).statusCode = 404;
      throw error;
    }

    if (!user.encryptionKey) {
        const error = new Error('사용자 암호화 키를 찾을 수 없습니다. 계정 설정이 올바른지 확인하세요.');
        (error as any).statusCode = 400;
        throw error;
    }

    const encryptedPassword = encrypt(password!, user.encryptionKey); // password가 undefined가 아님을 단언

    const passwordItem = await PasswordItem.create({
      ...passwordData, // passwordData를 직접 사용하되, password는 암호화된 것으로 덮어쓰기
      userId, // userId는 명시적으로 전달
      password: encryptedPassword,
      lastUsed: new Date(),
    } as any); // 타입스크립트가 PasswordItem.create의 복잡한 타입을 완벽히 추론하기 어려울 수 있어 any 사용

    return passwordItem;
  }

  // userId 타입을 number로 변경
  static async getAll(userId: number, queryParams: GetAllPasswordItemsQueryParams): Promise<IPasswordItemAttributes[]> {
    const { category, favorite, search, decrypt } = queryParams;

    // whereConditions 타입을 Sequelize의 WhereOptions로 명시하고, IPasswordItemAttributes 사용
    const whereConditions: WhereOptions<IPasswordItemAttributes> = { userId };
    // IPasswordItemAttributes는 ../types/passwordItemTypes에서 가져온 인터페이스이며,
    // PasswordItem 모델의 속성을 반영하도록 정의되어 있습니다.

    if (category) {
      (whereConditions as any).category = category; // IPasswordItemAttributes에 category가 있으므로 직접 할당 가능
    }

    if (favorite === 'true') {
      (whereConditions as any).isFavorite = true; // IPasswordItemAttributes에 isFavorite가 있으므로 직접 할당 가능
    }

    if (search) {
      const searchQuery = `%${search}%`;
      // Op.or 사용 시 타입 문제를 피하기 위해 whereConditions를 any로 캐스팅하거나, 
      // Op.or 내부의 각 객체가 IPasswordItemAttributes의 부분집합임을 명확히 함.
      (whereConditions as any)[Op.or] = [
        { title: { [Op.like]: searchQuery } },
        { url: { [Op.like]: searchQuery } },
        { username: { [Op.like]: searchQuery } },
        { notes: { [Op.like]: searchQuery } },
      ];
    }

    const passwordItems = await PasswordItem.findAll({
      where: whereConditions as WhereOptions<any>, // findAll에 전달 시에도 타입 호환성 위해 any 캐스팅 고려
      order: [['updatedAt', 'DESC']],
    });

    // item.toJSON()의 반환 타입은 기본적으로 모델의 속성들이지만, IPasswordItemAttributes로 캐스팅
    let processedItems = passwordItems.map(item => item.toJSON() as IPasswordItemAttributes);

    if (decrypt === 'true') {
      const user = await User.findByPk(userId);
      if (!user || !user.encryptionKey) {
        const error = new Error('비밀번호 복호화를 위한 사용자 암호화 키를 찾을 수 없습니다.');
        (error as any).statusCode = 400;
        throw error;
      }

      processedItems = processedItems.map(item => {
        const mutableItem = { ...item }; // 복호화된 비밀번호를 할당하기 위해 복사본 생성
        try {
          if (mutableItem.password) { 
            mutableItem.password = decryptPassword(mutableItem.password, user.encryptionKey!);
          }
        } catch (err) {
          console.error(`비밀번호 항목 ID [${mutableItem.id}] 복호화 오류:`, err);
          // mutableItem.password = 'DECRYPTION_ERROR'; // 오류 발생 시 처리
        }
        return mutableItem;
      });
    }
    return processedItems;
  }

  static async getById(userId: number, itemId: number): Promise<IPasswordItemAttributes | null> {
    const passwordItem = await PasswordItem.findOne({
      where: { id: itemId, userId },
    });

    if (!passwordItem) {
      const error = new Error('비밀번호 항목을 찾을 수 없습니다.');
      (error as any).statusCode = 404;
      throw error;
    }

    const user = await User.findByPk(userId);
    if (!user || !user.encryptionKey) {
      const error = new Error('비밀번호 복호화를 위한 사용자 정보를 찾을 수 없거나 암호화 키가 없습니다.');
      (error as any).statusCode = 400; // 또는 404, 상황에 따라
      throw error;
    }

    let decryptedPassword = passwordItem.password;
    try {
      decryptedPassword = decryptPassword(passwordItem.password, user.encryptionKey);
    } catch (err) {
      console.error(`비밀번호 항목 ID [${itemId}] 복호화 오류:`, err);
      const error = new Error('비밀번호 복호화에 실패했습니다.');
      (error as any).statusCode = 500;
      throw error;
    }

    // 마지막 사용 시간 업데이트
    passwordItem.lastUsed = new Date();
    await passwordItem.save();

    // toJSON()을 사용하여 순수 객체로 변환 후 비밀번호 필드 업데이트
    const itemData = passwordItem.toJSON() as IPasswordItemAttributes;
    itemData.password = decryptedPassword;

    return itemData;
  }

  static async update(userId: number, itemId: number, updateData: Partial<IPasswordItemCreationAttributes>): Promise<IPasswordItemAttributes> {
    const passwordItem = await PasswordItem.findOne({
      where: { id: itemId, userId },
    });

    if (!passwordItem) {
      const error = new Error('업데이트할 비밀번호 항목을 찾을 수 없습니다.');
      (error as any).statusCode = 404;
      throw error;
    }

    // 비밀번호가 업데이트 데이터에 포함되어 있다면 암호화합니다.
    if (updateData.password) {
      const user = await User.findByPk(userId);
      if (!user || !user.encryptionKey) {
        const error = new Error('비밀번호 암호화를 위한 사용자 정보를 찾을 수 없거나 암호화 키가 없습니다.');
        (error as any).statusCode = 400;
        throw error;
      }
      try {
        updateData.password = encrypt(updateData.password, user.encryptionKey);
      } catch (err) {
        console.error(`비밀번호 항목 ID [${itemId}] 암호화 오류:`, err);
        const error = new Error('비밀번호 암호화에 실패했습니다.');
        (error as any).statusCode = 500;
        throw error;
      }
    }

    // 제공된 데이터로 항목 업데이트 (타입 오류 해결을 위해 as any 사용)
    await passwordItem.update(updateData as any);
    
    // 업데이트된 항목의 최신 상태를 반환 (toJSON 사용)
    // password 필드는 암호화된 상태로 반환됨
    return passwordItem.toJSON() as IPasswordItemAttributes;
  }

  static async delete(userId: number, itemId: number): Promise<void> {
    const passwordItem = await PasswordItem.findOne({
      where: { id: itemId, userId },
    });

    if (!passwordItem) {
      const error = new Error('삭제할 비밀번호 항목을 찾을 수 없습니다.');
      (error as any).statusCode = 404;
      throw error;
    }

    await passwordItem.destroy();
    // 연관된 PasswordHistory도 삭제할지 여부는 정책에 따라 결정 (여기서는 PasswordItem만 삭제)
  }

  // 여기에 delete 등의 메소드가 추가될 예정입니다.

  static async getAllDecryptedItemsForUser(userId: number): Promise<any[]> {
    const user = await User.findByPk(userId);
    if (!user || !user.encryptionKey) {
      const error = new Error('사용자 정보를 찾을 수 없거나 암호화 키가 설정되지 않았습니다.');
      (error as any).statusCode = 404; // 또는 400
      throw error;
    }

    const items = await PasswordItem.findAll({ where: { userId } });

    return Promise.all(items.map(async (item) => {
      let decryptedPassword = '';
      try {
        // item.password가 null이거나 undefined가 아닐 때만 복호화 시도
        if (item.password) {
          decryptedPassword = decryptPassword(item.password, user.encryptionKey!);
        }
      } catch (decryptError) {
        console.error(`항목 ID ${item.id}의 비밀번호 복호화 실패:`, decryptError);
        // 복호화 실패 시 빈 문자열 또는 특정 오류 메시지로 처리 가능
        // 여기서는 빈 문자열로 처리
      }
      return {
        title: item.title,
        url: item.url,
        username: item.username,
        password: decryptedPassword, // 복호화된 비밀번호
        category: item.category,
        tags: item.tags,
        notes: item.notes,
        isFavorite: item.isFavorite,
        expiryDate: item.expiryDate,
        createdAt: item.createdAt?.toISOString(), // ISO 문자열로 변환
        updatedAt: item.updatedAt?.toISOString(), // ISO 문자열로 변환
      };
    }));
  }

  static async importItems(userId: number, itemsToImport: any[]): Promise<{ imported: number, skipped: number, errors: number }> {
    const user = await User.findByPk(userId);
    if (!user || !user.encryptionKey) {
      const error = new Error('항목 가져오기를 위한 사용자 정보를 찾을 수 없거나 암호화 키가 없습니다.');
      (error as any).statusCode = 400;
      throw error;
    }

    const importResults = {
      imported: 0,
      skipped: 0,
      errors: 0,
    };

    for (const item of itemsToImport) {
      try {
        if (!item.title || !item.password) {
          importResults.skipped++;
          continue;
        }

        const encryptedPassword = encrypt(item.password, user.encryptionKey);

        const existingItem = await PasswordItem.findOne({
          where: {
            userId,
            title: item.title,
            username: item.username || null,
          },
        });

        if (existingItem) {
          importResults.skipped++;
          continue;
        }

        await PasswordItem.create({
          userId,
          title: item.title,
          url: item.url === null ? undefined : item.url,
          username: item.username === null ? undefined : item.username,
          password: encryptedPassword,
          category: item.category === null ? undefined : item.category,
          tags: item.tags || [], // tags는 빈 배열로 처리
          notes: item.notes === null ? undefined : item.notes,
          isFavorite: item.isFavorite || false,
          expiryDate: item.expiryDate === null ? undefined : item.expiryDate,
          lastUsed: new Date(), // 가져온 항목의 lastUsed는 현재 시간으로 설정
        });

        importResults.imported++;
      } catch (error) {
        console.error('서비스에서 항목 가져오기 오류:', error);
        importResults.errors++;
      }
    }
    return importResults;
  }

  static async getExpiringItems(userId: number, days?: number, date?: string): Promise<PasswordItem[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작

    const expiryDateConditions: any[] = [{ [Op.ne]: null }]; // 만료일이 설정된 항목만 (IS NOT NULL)

    if (days !== undefined && !isNaN(days)) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + days);
      expiryDateConditions.push({ [Op.lte]: targetDate }); // 오늘부터 days 후까지 만료
      expiryDateConditions.push({ [Op.gte]: today });      // 이미 만료된 것은 제외 (선택적)
    } else if (date) {
      const targetExpiryDate = new Date(date);
      targetExpiryDate.setHours(23, 59, 59, 999); // 해당 날짜의 끝
      expiryDateConditions.push({ [Op.lte]: targetExpiryDate }); // 특정 날짜 또는 그 이전 만료
    } else {
      // days나 date가 없으면 이미 만료되었거나 오늘 만료되는 항목
      expiryDateConditions.push({ [Op.lte]: new Date() }); // 오늘 또는 그 이전 만료
    }

    const whereConditions: WhereOptions<Attributes<PasswordItem>> = {
      userId,
    };

    if (expiryDateConditions.length > 0) {
      // @ts-ignore Sequelize Operator 타입과 WhereAttributeHash 타입 간의 복잡성으로 인해 일시적으로 무시
      whereConditions.expiryDate = {
        [Op.and]: expiryDateConditions
      };
    }

    return PasswordItem.findAll({
      where: whereConditions,
      attributes: { exclude: ['password'] }, // 비밀번호는 제외
      order: [['expiryDate', 'ASC']],
    });
  }

  static async trackUsageAndUpdateLastUsed(
    userId: number,
    itemId: number,
    action: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<PasswordItem> {
    const passwordItem = await PasswordItem.findOne({
      where: { id: itemId, userId },
    });

    if (!passwordItem) {
      const error = new Error('비밀번호 항목을 찾을 수 없습니다.') as any;
      error.statusCode = 404;
      throw error;
    }

    passwordItem.lastUsed = new Date();
    await passwordItem.save();

    await PasswordHistory.create({
      passwordItemId: passwordItem.id,
      userId,
      action: action || 'view', // 기본값 'view'
      timestamp: new Date(),
      userAgent: userAgent || '',
      ipAddress: ipAddress || '',
    });

    return passwordItem;
  }
}
