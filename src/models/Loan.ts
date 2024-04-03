import { DataTypes , Model } from "sequelize";
import { sequelize } from  '../config/sequelize';

class Loan extends Model {}

Loan.init({
    loan_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    loan_amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    tenure: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    interest_rate: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    emi: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    emis_paid_on_time: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
}, {
    sequelize,
    modelName: 'Loan',
    tableName: 'loans',
    timestamps: false
});


export default Loan;
