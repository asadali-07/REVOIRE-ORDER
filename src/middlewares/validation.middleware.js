import { body, validationResult, param } from 'express-validator';
import mongoose from 'mongoose';

function validateResult(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

const orderIdValidation = [
    param('orderId')
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid order ID'),
    validateResult
];
const updateOrderAddressValidation = [
    param('orderId')
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid order ID'),
    body('shippingAddress')
        .exists()
        .withMessage('Shipping address is required')
        .isObject()
        .withMessage('Shipping address must be an object'),
    body('shippingAddress.street').notEmpty().withMessage("Street should not be empty").isString().withMessage("Should be a valid string"),
    body('shippingAddress.city').notEmpty().withMessage("City should not be empty").isString().withMessage("Should be a valid string"),
    body('shippingAddress.state').notEmpty().withMessage("State should not be empty").isString().withMessage("Should be a valid string"),
    body('shippingAddress.zip').notEmpty().withMessage("Zip code should not be empty").matches(/^\d{6}$/).withMessage("Zip code must be exactly 6 digits"),
    body('shippingAddress.country').notEmpty().withMessage("Country should not be empty").isString().withMessage("Should be a valid string"),
    validateResult
];

export { orderIdValidation, updateOrderAddressValidation };
