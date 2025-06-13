import { Request, Response } from 'express';
import { Tag, TagItem, PasswordItem } from '../models/index';
import { Op } from 'sequelize';

/**
 * 새 태그 생성
 */
export const createTag = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { name, color } = req.body;
    
    // 필수 필드 검증
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '태그 이름은 필수 입력 항목입니다.'
      });
    }
    
    // 이미 존재하는 태그인지 확인
    const existingTag = await Tag.findOne({
      where: { userId, name }
    });
    
    if (existingTag) {
      return res.status(409).json({
        success: false,
        message: '이미 동일한 이름의 태그가 존재합니다.'
      });
    }
    
    // 태그 생성
    const tag = await Tag.create({
      userId,
      name,
      color: color || '#2ecc71'
    });
    
    res.status(201).json({
      success: true,
      message: '태그가 성공적으로 생성되었습니다.',
      data: tag
    });
  } catch (error) {
    console.error('태그 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자의 모든 태그 조회
 */
export const getAllTags = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    
    const tags = await Tag.findAll({
      where: { userId },
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (error) {
    console.error('태그 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 특정 태그 조회
 */
export const getTag = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const tag = await Tag.findOne({
      where: { id: Number(id), userId }
    });
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: '태그를 찾을 수 없습니다.'
      });
    }
    
    // 해당 태그가 적용된 비밀번호 항목 개수 조회
    const itemCount = await TagItem.count({
      where: { tagId: tag.id }
    });
    
    res.status(200).json({
      success: true,
      data: {
        ...tag.get({ plain: true }),
        itemCount
      }
    });
  } catch (error) {
    console.error('태그 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 태그 업데이트
 */
export const updateTag = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { name, color } = req.body;
    
    // 태그 조회
    const tag = await Tag.findOne({
      where: { id: Number(id), userId }
    });
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: '태그를 찾을 수 없습니다.'
      });
    }
    
    // 이름이 변경되었고, 변경하려는 이름이 이미 존재하는지 확인
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({
        where: { userId, name }
      });
      
      if (existingTag) {
        return res.status(409).json({
          success: false,
          message: '이미 동일한 이름의 태그가 존재합니다.'
        });
      }
    }
    
    // 업데이트할 데이터 구성
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    
    // 데이터 업데이트
    await tag.update(updateData);
    
    res.status(200).json({
      success: true,
      message: '태그가 성공적으로 업데이트되었습니다.',
      data: tag
    });
  } catch (error) {
    console.error('태그 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 태그 삭제
 */
export const deleteTag = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    // 태그 조회
    const tag = await Tag.findOne({
      where: { id: Number(id), userId }
    });
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: '태그를 찾을 수 없습니다.'
      });
    }
    
    // 태그-항목 연결 삭제
    await TagItem.destroy({
      where: { tagId: tag.id }
    });
    
    // 태그 삭제
    await tag.destroy();
    
    res.status(200).json({
      success: true,
      message: '태그가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('태그 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 비밀번호 항목에 태그 추가
 */
export const addTagToPasswordItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { passwordItemId } = req.params;
    const { tagIds } = req.body;
    
    // 필수 필드 검증
    if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '추가할 태그 ID 목록이 필요합니다.'
      });
    }
    
    // 비밀번호 항목 조회
    const passwordItem = await PasswordItem.findOne({
      where: { id: Number(passwordItemId), userId }
    });
    
    if (!passwordItem) {
      return res.status(404).json({
        success: false,
        message: '비밀번호 항목을 찾을 수 없습니다.'
      });
    }
    
    // 태그 존재 여부 확인
    const tags = await Tag.findAll({
      where: { 
        id: { [Op.in]: tagIds },
        userId 
      }
    });
    
    if (tags.length !== tagIds.length) {
      return res.status(404).json({
        success: false,
        message: '일부 태그를 찾을 수 없습니다.'
      });
    }
    
    // 태그-항목 연결 생성
    const tagItems = [];
    for (const tag of tags) {
      // 이미 연결되어 있는지 확인
      const existingTagItem = await TagItem.findOne({
        where: { 
          tagId: tag.id, 
          passwordItemId: passwordItem.id 
        }
      });
      
      if (!existingTagItem) {
        const tagItem = await TagItem.create({
          tagId: tag.id,
          passwordItemId: passwordItem.id
        });
        tagItems.push(tagItem);
      }
    }
    
    res.status(200).json({
      success: true,
      message: '태그가 성공적으로 추가되었습니다.',
      data: {
        addedCount: tagItems.length
      }
    });
  } catch (error) {
    console.error('태그 추가 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 비밀번호 항목에서 태그 제거
 */
export const removeTagFromPasswordItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { passwordItemId, tagId } = req.params;
    
    // 비밀번호 항목 조회
    const passwordItem = await PasswordItem.findOne({
      where: { id: Number(passwordItemId), userId }
    });
    
    if (!passwordItem) {
      return res.status(404).json({
        success: false,
        message: '비밀번호 항목을 찾을 수 없습니다.'
      });
    }
    
    // 태그 조회
    const tag = await Tag.findOne({
      where: { id: Number(tagId), userId }
    });
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: '태그를 찾을 수 없습니다.'
      });
    }
    
    // 태그-항목 연결 삭제
    const deleted = await TagItem.destroy({
      where: { 
        tagId: tag.id, 
        passwordItemId: passwordItem.id 
      }
    });
    
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: '해당 항목에 이 태그가 적용되어 있지 않습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '태그가 성공적으로 제거되었습니다.'
    });
  } catch (error) {
    console.error('태그 제거 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 비밀번호 항목의 모든 태그 조회
 */
export const getPasswordItemTags = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { passwordItemId } = req.params;
    
    // 비밀번호 항목 조회
    const passwordItem = await PasswordItem.findOne({
      where: { id: Number(passwordItemId), userId },
      include: [
        {
          model: Tag,
          through: { attributes: [] } // TagItem 테이블의 속성은 제외
        }
      ]
    });
    
    if (!passwordItem) {
      return res.status(404).json({
        success: false,
        message: '비밀번호 항목을 찾을 수 없습니다.'
      });
    }
    
    // 태그 목록 가져오기
    const plainPasswordItem = passwordItem.get({ plain: true }) as any;
    
    res.status(200).json({
      success: true,
      data: plainPasswordItem.Tags || []
    });
  } catch (error) {
    console.error('태그 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 태그별 비밀번호 항목 통계 조회
 */
export const getTagStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    
    // 모든 태그 조회
    const tags = await Tag.findAll({
      where: { userId },
      attributes: ['id', 'name', 'color'],
      order: [['name', 'ASC']]
    });
    
    // 각 태그별 항목 개수 조회
    const stats = await Promise.all(
      tags.map(async (tag) => {
        const count = await TagItem.count({
          where: { tagId: tag.id }
        });
        
        return {
          id: tag.id,
          name: tag.name,
          color: tag.color,
          count
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('태그 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};
