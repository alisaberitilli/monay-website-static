export default (sequelize, DataTypes) => {
  const KycDocument = sequelize.define(
    'KycDocument',
    {
      requiredDocumentName: {
        type: DataTypes.STRING(100)
      },
      documentKey: {
        type: DataTypes.STRING(11)
      },
      countryCode: {
        type: DataTypes.STRING(100)
      },
      type: {
        type: DataTypes.STRING(100)
      },
      uploadImageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
    },
    {
      underscored: false,
      tableName: 'kyc_documents'
    }
  );
  return KycDocument;
};
