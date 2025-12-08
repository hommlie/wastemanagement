// models/Category.js
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      name: { type: DataTypes.STRING(191), allowNull: false },
      image: { type: DataTypes.STRING(255), allowNull: true },
      status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "category",
      underscored: true,
      timestamps: true,
      paranoid: true, 
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  Category.associate = (models) => {
    Category.hasMany(models.Variation, {
      foreignKey: "category_id",
      as: "variation",
    });

    Category.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return Category;
};
