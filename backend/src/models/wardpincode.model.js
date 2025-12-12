// backend/src/models/ward_pincode.js
module.exports = (sequelize, DataTypes) => {
  const WardPincode = sequelize.define('WardPincode', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ward_id: { type: DataTypes.INTEGER, allowNull: false },
    pincode: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'ward_pincode',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['ward_id', 'pincode'],
        name: 'ward_pincode_unique'
      }
    ]
  });

  return WardPincode;
};
