"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const address_model_1 = require("./address.model");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
router.get('/', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        const addresses = await address_model_1.Address.find({ user: req.user.userId, deletedAt: null }).sort({ isDefault: -1 });
        (0, responses_1.sendSuccess)(res, addresses);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        if (req.body.isDefault) {
            await address_model_1.Address.updateMany({ user: req.user.userId }, { isDefault: false });
        }
        const address = await address_model_1.Address.create({ ...req.body, user: req.user.userId });
        (0, responses_1.sendCreated)(res, address, 'Address added');
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        const address = await address_model_1.Address.findOne({ _id: req.params.id, user: req.user.userId });
        if (!address)
            throw new errors_1.NotFoundError('Address');
        if (req.body.isDefault) {
            await address_model_1.Address.updateMany({ user: req.user.userId }, { isDefault: false });
        }
        Object.assign(address, req.body);
        await address.save();
        (0, responses_1.sendSuccess)(res, address, 'Address updated');
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        const address = await address_model_1.Address.findOne({ _id: req.params.id, user: req.user.userId });
        if (!address)
            throw new errors_1.NotFoundError('Address');
        address.deletedAt = new Date();
        await address.save();
        (0, responses_1.sendNoContent)(res);
    }
    catch (err) {
        next(err);
    }
});
router.patch('/:id/default', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        await address_model_1.Address.updateMany({ user: req.user.userId }, { isDefault: false });
        const address = await address_model_1.Address.findOneAndUpdate({ _id: req.params.id, user: req.user.userId }, { isDefault: true }, { new: true });
        if (!address)
            throw new errors_1.NotFoundError('Address');
        (0, responses_1.sendSuccess)(res, address, 'Default address updated');
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=address.routes.js.map