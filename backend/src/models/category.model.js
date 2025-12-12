// models/category.js
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      created_by: { type: DataTypes.INTEGER, allowNull: true },
      updated_by: { type: DataTypes.INTEGER, allowNull: true },

      name: { type: DataTypes.STRING(191), allowNull: false },
      slug: { type: DataTypes.STRING(191), allowNull: false, unique: true },
      images: { type: DataTypes.JSON, allowNull: true },
      status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },

      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "category",
      timestamps: false,
      underscored: true,
    }
  );

  return Category;
};
