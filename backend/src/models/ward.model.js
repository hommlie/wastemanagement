module.exports = (sequelize, DataTypes) => {
  const Ward = sequelize.define('Ward', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    division_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'ward',
    timestamps: false,
    underscored: true
  });

  return Ward;
};
