// services/itemService.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

export class ItemService {
  
  /**
   * Get all items filtered by availability status and excluding requesting user's items
   */
  static async getAllItems(userId = null) {
    const whereCondition = {
      status: 'AVAILABLE'
    };

    // Exclude the requesting user's own items if userId is provided
    if (userId) {
      whereCondition.user_id = {
        not: userId
      };
    }

    const items = await prisma.item.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            image: true, 
            badge: true, 
            latitude: true,
            longitude: true 
          }
        },
        images: true,
        _count: {
          select: { trade_requests_for: { where: { status: 'PENDING' } } }
        }
      },
      orderBy: { posted_at: 'desc' }
    });

    return items;
  }

  /**
   * Get single item by ID
   */
  static async getItemById(itemId) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            image: true, 
            badge: true, 
            latitude: true,
            longitude: true 
          }
        },
        images: true,
        trade_requests_for: {
          where: { status: 'PENDING' },
          include: {
            offered_item: {
              include: { 
                images: true,
                user: { select: { name: true, image: true } }
              }
            },
            requester: {
              select: { name: true, image: true }
            }
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!item) {
      throw new Error('Item not found');
    }

    return item;
  }

  /**
   * Create a new item
   */
  static async createItem(itemData, userId, files) {
    const { title, description, category, condition, phone_number, whatsapp_number, latitude, longitude } = itemData;
    console.log(itemData)

    // Create item
    const item = await prisma.item.create({
      data: {
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        condition: condition,
        phone_number: phone_number.trim(),
        whatsapp_number: whatsapp_number?.trim() || null,
        status: 'AVAILABLE',
        latitude,
        longitude
      },
      include: {
        user: {
          select: { name: true, image: true }
        },
        images: true
      }
    });

    // Add images if uploaded
    if (itemData.images && itemData.images.length > 0) {
      const imageData = itemData.images.map((file) => ({
        item_id: item.id,
        url: `/uploads/items/${file.filename}`
      }));
      console.log('Image data to be added:', imageData);

      await prisma.itemImage.createMany({
        data: imageData
      });

      // Fetch item with images
      const itemWithImages = await prisma.item.findUnique({
        where: { id: item.id },
        include: { 
          user: {
            select: { name: true, image: true }
          },
          images: true
        }
      });

      return itemWithImages;
    }

    return item;
  }

  /**
   * Update an item
   */
  static async updateItem(itemId, userId, updateData, files, removeImageIds) {
    // Check ownership
    const existingItem = await prisma.item.findFirst({
      where: { id: itemId, user_id: userId },
      include: { images: true }
    });

    if (!existingItem) {
      throw new Error('Item not found or access denied');
    }

    // Update item details
    const filteredUpdateData = {};
    if (updateData.title) filteredUpdateData.title = updateData.title.trim();
    if (updateData.description) filteredUpdateData.description = updateData.description.trim();
    if (updateData.category) filteredUpdateData.category = updateData.category.trim();
    if (updateData.condition) filteredUpdateData.condition = updateData.condition;
    if (updateData.phone_number) filteredUpdateData.phone_number = updateData.phone_number.trim();
    if (updateData.whatsapp_number !== undefined) {
      filteredUpdateData.whatsapp_number = updateData.whatsapp_number?.trim() || null;
    }

    if (Object.keys(filteredUpdateData).length > 0) {
      filteredUpdateData.updated_at = new Date();
      
      await prisma.item.update({
        where: { id: itemId },
        data: filteredUpdateData
      });
    }

    // Handle image removal
    if (removeImageIds && removeImageIds.length > 0) {
      // Get image files to delete from filesystem
      const imagesToDelete = await prisma.itemImage.findMany({
        where: { 
          id: { in: removeImageIds },
          item_id: itemId 
        }
      });

      // Delete from filesystem
      imagesToDelete.forEach(img => {
        const filePath = path.join(__dirname, '..', img.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      // Delete from database
      await prisma.itemImage.deleteMany({
        where: { 
          id: { in: removeImageIds },
          item_id: itemId 
        }
      });
    }

    // Add new images
    if (files && files.length > 0) {
      // Get current max order
      const maxOrder = await prisma.itemImage.findFirst({
        where: { item_id: itemId },
        orderBy: { order: 'desc' },
        select: { order: true }
      });

      const startOrder = maxOrder ? maxOrder.order + 1 : 0;
      
      const newImageData = files.map((file, index) => ({
        item_id: itemId,
        url: `/uploads/items/${file.filename}`,
        order: startOrder + index
      }));

      await prisma.itemImage.createMany({
        data: newImageData
      });
    }

    // Return updated item with images
    return await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        user: {
          select: { name: true, image: true }
        },
        images: { orderBy: { order: 'asc' } }
      }
    });
  }

  /**
   * Delete an item
   */
  static async deleteItem(itemId, userId) {
    // Check ownership and pending trades
    const item = await prisma.item.findFirst({
      where: { id: itemId, user_id: userId },
      include: { 
        images: true,
        trade_requests_for: { where: { status: 'PENDING' } }
      }
    });

    if (!item) {
      throw new Error('Item not found or access denied');
    }

    if (item.trade_requests_for.length > 0) {
      throw new Error('Cannot delete item with pending trade requests');
    }

    // Delete images from filesystem
    item.images.forEach(img => {
      const filePath = path.join(__dirname, '..', img.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Delete from database (cascade will handle images and trade requests)
    await prisma.item.delete({
      where: { id: itemId }
    });

    return { message: 'Item deleted successfully' };
  }

  /**
   * Update item status
   */
  static async updateItemStatus(itemId, userId, status) {
    // Check ownership
    const item = await prisma.item.findFirst({
      where: { id: itemId, user_id: userId }
    });

    if (!item) {
      throw new Error('Item not found or access denied');
    }

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { status },
      include: {
        images: true,
        _count: { select: { trade_requests_for: true } }
      }
    });

    return updatedItem;
  }

  /**
   * Get all categories
   */
  static async getCategories() {
    const categories = await prisma.item.findMany({
      where: { status: 'AVAILABLE' },
      select: { category: true },
      distinct: ['category']
    });

    return categories.map(c => c.category).sort();
  }

  /**
   * Get items by user ID
   */
  static async getItemsByUser(userId) {


    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where: { user_id: userId },
        include: {
          images: {  },
          _count: {
            select: { 
              trade_requests_for: { where: { status: 'PENDING' } }
            }
          }
        },
        orderBy: { posted_at: 'desc' },
      }),
      prisma.item.count({ where: { user_id: userId } })
    ]);

    return {
      items,

    };
  }
}
