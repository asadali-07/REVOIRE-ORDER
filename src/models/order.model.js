import mongoose from 'mongoose';    


const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
});

const orderSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    items: [
         {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            title: {
                type: String,
                required: true,
                trim: true,
            },
            category: {
                type: String,
                required: true,
            },
            price: {
                amount: {
                    type: Number,
                    required: true,
                    min: 0
                },
                currency: {
                    type: String,
                    enum: ['USD', 'INR'],
                    default: 'INR'
                }
            },
            stock: {
                type: Number,
                min: 0,
                required: true,
            },
            images: [
                {
                    url: String,
                    thumbnail: String,
                    fileId: String
                }
            ],
            quantity: {
                type: Number,
                required: true,
                default: 1,
                min: 1,
            },
        },
    ],
    status: {
        type: String,
        enum: [ "PENDING", "CONFIRMED", "CANCELLED", "SHIPPED", "DELIVERED" ],
    },
    totalPrice: {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            required: true,
            enum: [ "USD", "INR" ]
        }
    },
    shippingAddress: {
        type: addressSchema,
        required: true
    },
}, { timestamps: true });


const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;
