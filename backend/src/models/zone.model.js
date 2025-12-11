// backend/src/models/zone.model.js
module.exports = (sequelize, DataTypes) => {
  const Zone = sequelize.define(
    "Zone",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      corporation_id: { type: DataTypes.INTEGER, allowNull: false },
      code: { type: DataTypes.STRING(50), allowNull: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 }
    },
    {
      tableName: "zones",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  );

  Zone.associate = (models) => {
    if (models.Corporation) Zone.belongsTo(models.Corporation, { foreignKey: "corporation_id", as: "corporation" });
    // keep pincode association only if ZonePincode exists (kept in index.js)
  };

  return Zone;
};
