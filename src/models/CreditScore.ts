import { DataTypes, Model } from "sequelize";
import { sequelize } from  '../config/sequelize';

class CreditScore extends Model {}

CreditScore.init({
    credit_score_id: {
        type: DataTypes.INTEGER,
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    credit_score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    sequelize,
    modelName: 'CreditScore',
    tableName: 'credit_scores',
    timestamps: false
});

export default CreditScore;