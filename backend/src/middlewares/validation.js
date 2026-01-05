const { z } = require("zod");
const { ApiError } = require("../utils");

const validateRequest = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        req.body = parsed.body;
        req.query = parsed.query;
        req.params = parsed.params;
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors.map((issue) => ({
                message: `${issue.path.join(".")} is ${issue.message}`,
            }));
            console.log("Validation Error Details:", JSON.stringify(errorMessages, null, 2));
            next(new ApiError(400, "Validation Error", errorMessages));
        } else {
            next(new ApiError(500, "Internal Server Error"));
        }
    }
};

module.exports = { validateRequest };
