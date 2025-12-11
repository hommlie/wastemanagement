// backend/src/models/corporation.model.js
module.exports = (sequelize, DataTypes) => {
  const Corporation = sequelize.define(
    "Corporation",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      state_id: { type: DataTypes.INTEGER, allowNull: false },
      city_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(255), allowNull: false },
      status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 }
    },
    {
      tableName: "corporations",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  );

  Corporation.associate = (models) => {
    if (models.State) Corporation.belongsTo(models.State, { foreignKey: "state_id", as: "state" });
    if (models.City) Corporation.belongsTo(models.City, { foreignKey: "city_id", as: "city" });
    if (models.Zone) Corporation.hasMany(models.Zone, { foreignKey: "corporation_id", as: "zones" });
  };

  return Corporation;
};
