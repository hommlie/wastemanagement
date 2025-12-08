// models/Variation.js
module.exports = (sequelize, DataTypes) => {
  const Variation = sequelize.define(
    "Variation",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      category_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      name: { type: DataTypes.STRING(191), allowNull: false },
      code: { type: DataTypes.STRING(100), allowNull: true, unique: true },
      number_of_services: { type: DataTypes.INTEGER, allowNull: true },
      schedule_after_days: { type: DataTypes.INTEGER, allowNull: true },
      min_weight_kg: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
      max_weight_kg: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
      base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      per_kg_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "variation",
      underscored: true,
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  Variation.associate = (models) => {
    Variation.belongsTo(models.Category, {
      foreignKey: "category_id",
      as: "category",
    });
  };

  return Variation;
};
