import Order from "../models/order.model.js";
import axios from "axios";
import {publishToQueue} from "../broker/broker.js";

export const createOrder = async (req, res) => {
    try {
        const userResponse = await axios.get(`http://localhost:3000/api/auth/users/me`, {
            headers: {
                Authorization: `Bearer ${req.cookies.token}`
            }
        });
        const cartResponse = await axios.get(`http://localhost:3002/api/cart`, {
            headers: {
                Authorization: `Bearer ${req.cookies.token}`
            }
        });
        const shippingAddress = userResponse.data.user.addresses.find(addr => addr.isDefault);
        if (!shippingAddress) {
            return res.status(400).json({ error: "No default shipping address found" });
        }
        const totalAmount = cartResponse.data.cart.items.reduce((total, item) => {
            return total + (item.price.amount * item.quantity);
        }, 0);

        const order = await Order.create({
            user: req.user.id,
            items: cartResponse.data.cart.items,
            status: "PENDING",
            totalPrice: {
                amount: totalAmount,
                currency: cartResponse.data.cart.items[0].price.currency || "INR",
            },
            shippingAddress
        });

        await Promise.all([
            publishToQueue('ORDER_SELLER_DASHBOARD.ORDER_CREATED', order),
            axios.delete(`http://localhost:3002/api/cart/clear`, {
            headers: {
                Authorization: `Bearer ${req.cookies.token}`
            }
            })
        ]);

        res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getOrderById = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ error: "This order does not belong to you" });
        }
        res.status(200).json({ message: "Order fetched successfully", order });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllUserOrders = async (req, res) => {
    try {
        const orders = (await Order.find({ user: req.user.id }));
        res.status(200).json({ message: "Orders fetched successfully", orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const cancelOrder = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ error: "This order does not belong to you" });
        }
        if (order.status === "CANCELLED") {
            return res.status(400).json({ error: "Order is already cancelled" });
        }
        if (order.status === "PENDING" || order.status === "CONFIRMED") {
            order.status = "CANCELLED";
        } else {
            return res.status(400).json({ error: "Order cannot be cancelled" });
        }
        await order.save();
        res.status(200).json({ message: "Order cancelled successfully", order });
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateOrderAddress = async (req, res) => {
    const { orderId } = req.params;
    const { shippingAddress } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ error: "This order does not belong to you" });
        }
        if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
            return res.status(400).json({ error: "Only orders with PENDING or CONFIRMED status can update address" });
        }
        order.shippingAddress = shippingAddress;
        await order.save();
        res.status(200).json({ message: "Order address updated successfully", order });
    } catch (error) {
        console.error("Error updating order address:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}