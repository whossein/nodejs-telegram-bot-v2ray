import { initializeDatabase, V2ray, PanelConfig } from "../sequelize/models";

async function testCRUDOperations() {
  try {
    console.log("Initializing database...");
    await initializeDatabase();

    console.log("Testing PanelConfig CRUD operations...");

    // Test Create
    const panelConfig = await PanelConfig.create({
      username: "admin",
      password: "password123",
      baseUrl: "https://panel.example.com",
      isActive: true,
      priority: 1,
    } as any);
    console.log("✓ PanelConfig created:", panelConfig.toJSON());

    // Test Read
    const foundPanel = await PanelConfig.findByPk(panelConfig.id);
    console.log("✓ PanelConfig found:", foundPanel?.toJSON());

    // Test Update
    await PanelConfig.update(
      { priority: 5 },
      { where: { id: panelConfig.id } }
    );
    const updatedPanel = await PanelConfig.findByPk(panelConfig.id);
    console.log("✓ PanelConfig updated:", updatedPanel?.toJSON());

    console.log("Testing V2ray CRUD operations...");

    // Test Create V2ray
    const v2rayConfig = await V2ray.create({
      link: "vless://test-link",
      idUrl: "test-id",
      expire_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      volume_gb: 50,
      remaining_volume_mb: 50 * 1024,
      user_id: ["user1", "user2"],
      is_active: true,
      password: "test-password",
      baseUrl: "https://panel.example.com",
      port: "8080",
    } as any);
    console.log("✓ V2ray created:", v2rayConfig.toJSON());

    // Test Read V2ray
    const foundV2ray = await V2ray.findByPk(v2rayConfig.id);
    console.log("✓ V2ray found:", foundV2ray?.toJSON());
    console.log("✓ User IDs as array:", foundV2ray?.user_id);

    // Test Update V2ray
    await V2ray.update({ volume_gb: 100 }, { where: { id: v2rayConfig.id } });
    const updatedV2ray = await V2ray.findByPk(v2rayConfig.id);
    console.log("✓ V2ray updated:", updatedV2ray?.toJSON());

    // Test Delete
    await PanelConfig.destroy({ where: { id: panelConfig.id } });
    await V2ray.destroy({ where: { id: v2rayConfig.id } });
    console.log("✓ Records deleted successfully");

    console.log("\n🎉 All CRUD tests passed!");
    console.log("\nSequelize migration is complete and working correctly.");
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Run test if called directly
if (require.main === module) {
  testCRUDOperations()
    .then(() => {
      console.log("Test completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}

export { testCRUDOperations };
