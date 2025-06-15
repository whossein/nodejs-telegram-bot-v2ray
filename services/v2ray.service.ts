import { V2ray, V2rayModel } from "../sequelize/models";
import { Op } from "sequelize";

export async function createV2ray(data: Partial<V2rayModel>) {
  return V2ray.create(data as any);
}

export async function updateV2ray(id: number, data: Partial<V2rayModel>) {
  const [affectedCount] = await V2ray.update(data as any, {
    where: { id },
    returning: true,
  });

  if (affectedCount > 0) {
    return V2ray.findByPk(id);
  }
  return null;
}

export async function getV2rayById(v2rayId: string | number) {
  try {
    const v2ray = await V2ray.findOne({
      where: {
        id: v2rayId,
      },
    });

    return v2ray;
  } catch (e: any) {
    console.log("getV2rayById error: ", e);
    return null;
  }
}

export async function getV2rayByLink(v2rayLink: string) {
  try {
    const v2ray = await V2ray.findOne({
      where: {
        link: v2rayLink,
      },
    });

    return v2ray;
  } catch (e: any) {
    console.log("getV2rayByLink error: ", e);
    return null;
  }
}

export async function getV2rayByIdUrl(v2rayIdUrl: string) {
  try {
    const v2ray = await V2ray.findOne({
      where: {
        [Op.or]: [
          { idUrl: v2rayIdUrl },
          { password: v2rayIdUrl },
          { id: v2rayIdUrl },
        ],
      },
    });

    return v2ray;
  } catch (e: any) {
    console.log("getV2rayByIdUrl error: ", e);
    return null;
  }
}

export async function updateOrCreateV2ray(data: Partial<V2rayModel>) {
  try {
    // Note: In Sequelize, we need to handle JSON array search differently
    // Since user_id is stored as JSON string, we'll search by link and other criteria
    const existingV2ray = await V2ray.findOne({
      where: {
        link: data.link,
      },
    });

    if (existingV2ray) {
      // Get current user_ids and merge with new ones
      const currentUserIds: string[] = Array.isArray(existingV2ray.user_id)
        ? existingV2ray.user_id
        : [];
      const newUserIds: string[] = Array.isArray(data.user_id)
        ? data.user_id
        : [];

      // Merge user IDs, avoiding duplicates
      const mergedUserIds = [
        ...currentUserIds,
        ...newUserIds.filter((id: string) => !currentUserIds.includes(id)),
      ];

      const updateData = {
        ...data,
        user_id: mergedUserIds,
      };

      const [affectedCount] = await V2ray.update(updateData as any, {
        where: { id: existingV2ray.id },
      });

      return affectedCount > 0;
    }

    // Create new record
    const newV2ray = await createV2ray(data);
    return newV2ray;
  } catch (e: any) {
    console.log("updateOrCreateV2ray error:", e);
    return null;
  }
}
