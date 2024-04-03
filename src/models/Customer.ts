const { DataTypes, Model } = require('sequelize');
import { sequelize } from  '../config/sequelize';

class Customer extends Model {}

Customer.init({
    customer_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    monthly_salary: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    approved_limit: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    current_debt: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: false
});

export default Customer;