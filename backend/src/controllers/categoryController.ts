import { Request, Response } from 'express';
import { Category, PasswordItem } from '../models/index';
import { Op } from 'sequelize';

/**
 * 새 카테고리 생성
 */
export const createCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { name, color, icon, description } = req.body;
    
    // 필수 필드 검증
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '카테고리 이름은 필수 입력 항목입니다.'
      });
    }
    
    // 이미 존재하는 카테고리인지 확인
    const existingCategory = await Category.findOne({
      where: { userId, name }
    });
    
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: '이미 동일한 이름의 카테고리가 존재합니다.'
      });
    }
    
    // 카테고리 생성
    const category = await Category.create({
      userId,
      name,
      color: color || '#3498db',
      icon: icon || 'folder',
      description: description || null
    });
    
    res.status(201).json({
      success: true,
      message: '카테고리가 성공적으로 생성되었습니다.',
      data: category
    });
  } catch (error) {
    console.error('카테고리 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자의 모든 카테고리 조회
 */
export const getAllCategories = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    
    const categories = await Category.findAll({
      where: { userId },
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 특정 카테고리 조회
 */
export const getCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const category = await Category.findOne({
      where: { id: Number(id), userId }
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '카테고리를 찾을 수 없습니다.'
      });
    }
    
    // 해당 카테고리에 속한 비밀번호 항목 개수 조회
    const itemCount = await PasswordItem.count({
      where: { userId, category: category.name }
    });
    
    res.status(200).json({
      success: true,
      data: {
        ...category.get({ plain: true }),
        itemCount
      }
    });
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 카테고리 업데이트
 */
export const updateCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { name, color, icon, description } = req.body;
    
    // 카테고리 조회
    const category = await Category.findOne({
      where: { id: Number(id), userId }
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '카테고리를 찾을 수 없습니다.'
      });
    }
    
    // 이름이 변경되었고, 변경하려는 이름이 이미 존재하는지 확인
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: { userId, name }
      });
      
      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: '이미 동일한 이름의 카테고리가 존재합니다.'
        });
      }
      
      // 카테고리 이름이 변경된 경우, 관련된 비밀번호 항목들의 카테고리도 업데이트
      if (name !== category.name) {
        await PasswordItem.update(
          { category: name },
          { where: { userId, category: category.name } }
        );
      }
    }
    
    // 업데이트할 데이터 구성
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (description !== undefined) updateData.description = description;
    
    // 데이터 업데이트
    await category.update(updateData);
    
    res.status(200).json({
      success: true,
      message: '카테고리가 성공적으로 업데이트되었습니다.',
      data: category
    });
  } catch (error) {
    console.error('카테고리 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 카테고리 삭제
 */
export const deleteCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { reassignTo } = req.query; // 선택적으로 항목들을 재할당할 카테고리 ID
    
    // 카테고리 조회
    const category = await Category.findOne({
      where: { id: Number(id), userId }
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '카테고리를 찾을 수 없습니다.'
      });
    }
    
    // 해당 카테고리에 속한 비밀번호 항목 처리
    if (reassignTo) {
      // 재할당할 카테고리 조회
      const targetCategory = await Category.findOne({
        where: { id: Number(reassignTo as string), userId }
      });
      
      if (!targetCategory) {
        return res.status(404).json({
          success: false,
          message: '재할당할 카테고리를 찾을 수 없습니다.'
        });
      }
      
      // 비밀번호 항목들의 카테고리 업데이트
      await PasswordItem.update(
        { category: targetCategory.name },
        { where: { userId, category: category.name } }
      );
    } else {
      // 재할당 없이 카테고리만 빈 문자열로 설정
      await PasswordItem.update(
        { category: '' },
        { where: { userId, category: category.name } }
      );
    }
    
    // 카테고리 삭제
    await category.destroy();
    
    res.status(200).json({
      success: true,
      message: '카테고리가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('카테고리 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 카테고리별 비밀번호 항목 통계 조회
 */
export const getCategoryStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    
    // 모든 카테고리 조회
    const categories = await Category.findAll({
      where: { userId },
      attributes: ['id', 'name', 'color', 'icon'],
      order: [['name', 'ASC']]
    });
    
    // 각 카테고리별 항목 개수 조회
    const stats = await Promise.all(
      categories.map(async (category) => {
        const count = await PasswordItem.count({
          where: { userId, category: category.name }
        });
        
        return {
          id: category.id,
          name: category.name,
          color: category.color,
          icon: category.icon,
          count
        };
      })
    );
    
    // 카테고리가 없는 항목 개수 조회
    const uncategorizedCount = await PasswordItem.count({
      where: {
        userId,
        [Op.or]: [
          { category: '' }
        ]
      }
    });
    
    // 결과에 '미분류' 카테고리 추가
    stats.push({
      id: 0,
      name: '미분류',
      color: '#95a5a6',
      icon: 'folder-open',
      count: uncategorizedCount
    });
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('카테고리 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};
