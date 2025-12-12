module.exports = (sequelize, DataTypes) => {
  const Subcategory = sequelize.define("Subcategory", {
    title: {
      type: DataTypes.STRING,
      allowNull: true
    }
    // add more fields if required
  }, {
    tableName: "subcategory",
    underscored: true
  });

  return Subcategory;
};
