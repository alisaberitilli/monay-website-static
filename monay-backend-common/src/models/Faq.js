export default (sequelize, DataTypes) => {
  const Faq = sequelize.define(
    'Faq',
    {
      question: {
        type: DataTypes.STRING(200)
      },
      answer: {
        type: DataTypes.TEXT
      },
      userType: {
        type: DataTypes.ENUM('user', 'merchant')
      }
    },
    {
      underscored: false,
      tableName: 'faqs'
    },
  );

  Faq.associate = function (models) { };
  return Faq;
};
