import { PanelConfig, PanelConfigModel } from "../sequelize/models";
import { Op } from "sequelize";

export async function createPanelConfig(data: Partial<PanelConfigModel>) {
  const panel = await PanelConfig.create(data as any);
  return panel;
}

export async function getPanelConfigByBaseUrl(
  baseUrl: string
): Promise<PanelConfigModel | null> {
  const panel = await PanelConfig.findOne({
    where: {
      baseUrl: {
        [Op.like]: `%${baseUrl}%`, // Case-insensitive like
      },
    },
  });

  return panel;
}

export async function getActivePanelConfig(): Promise<PanelConfigModel | null> {
  // Get active, healthy panels ordered by priority (highest first)
  const panel = await PanelConfig.findOne({
    where: {
      isActive: true,
      // Only check for explicitly false values - treat null/undefined as healthy
      isHealthy: { [Op.ne]: false },
    },
    order: [
      ["priority", "DESC"], // Higher priority first
      ["createdAt", "ASC"], // Then oldest first
    ],
  });

  return panel;
}

export async function getAllPanelConfigs(): Promise<PanelConfigModel[]> {
  const panels = await PanelConfig.findAll({});
  return panels;
}

export async function getPanelConfigById(
  id: number
): Promise<PanelConfigModel | null> {
  const panel = await PanelConfig.findByPk(id);
  return panel;
}

export async function updatePanelConfig(
  id: number,
  updateData: Partial<PanelConfigModel>
): Promise<PanelConfigModel | null> {
  const [affectedCount] = await PanelConfig.update(updateData as any, {
    where: { id },
  });

  if (affectedCount > 0) {
    return PanelConfig.findByPk(id);
  }
  return null;
}

export async function deletePanelConfig(id: number): Promise<boolean> {
  const deletedCount = await PanelConfig.destroy({
    where: { id },
  });
  return deletedCount > 0;
}

// Advanced selection with load balancing (you can implement your own logic)
export async function selectOptimalPanel(): Promise<PanelConfigModel | null> {
  const panels = await getAllPanelConfigs();

  if (panels.length === 0) {
    return null;
  }

  // Simple round-robin selection (you can implement more sophisticated logic)
  // For now, just return a random panel
  const randomIndex = Math.floor(Math.random() * panels.length);
  return panels[randomIndex];
}
